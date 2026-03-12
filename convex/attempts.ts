import { mutation, action, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// ─── Save full attempt ────────────────────────────────────────────────────────
export const saveAttempt = mutation({
  args: {
    userId: v.id("users"),
    examId: v.id("exams"),       // ✅ was testId: v.id("tests")
    score: v.number(),
    accuracy: v.number(),
    timeTakenSeconds: v.number(),
    startedAt: v.number(),
    completedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("attempts", { ...args });
  },
});

// ─── Save per question answers ────────────────────────────────────────────────
export const saveAttemptAnswers = mutation({
  args: {
    attemptId: v.id("attempts"),
    answers: v.array(
      v.object({
        questionId: v.id("questions"),
        selectedOptionIndex: v.number(),
        isCorrect: v.boolean(),
        timeSpentSeconds: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const answer of args.answers) {
      await ctx.db.insert("attemptAnswers", {
        attemptId: args.attemptId,
        ...answer,
      });
    }
  },
});

// ─── Update topic stats ───────────────────────────────────────────────────────
export const updateTopicStats = mutation({
  args: {
    userId: v.id("users"),
    topicId: v.id("topics"),
    attempted: v.number(),
    correct: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userTopicStats")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("topicId"), args.topicId))
      .first();

    const accuracyPercentage = Math.round(
      (args.correct / args.attempted) * 100
    );

    if (existing) {
      const newAttempted = existing.attempted + args.attempted;
      const newCorrect = existing.correct + args.correct;
      const newAccuracy = Math.round((newCorrect / newAttempted) * 100);
      await ctx.db.patch(existing._id, {
        attempted: newAttempted,
        correct: newCorrect,
        accuracyPercentage: newAccuracy,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert("userTopicStats", {
        userId: args.userId,
        topicId: args.topicId,
        attempted: args.attempted,
        correct: args.correct,
        accuracyPercentage,
        lastUpdated: Date.now(),
      });
    }
  },
});

// ─── Master action — called from frontend ────────────────────────────────────
export const saveQuizResult = action({
  args: {
    userId: v.id("users"),
    examId: v.id("exams"),       // ✅ was testId: v.id("tests")
    topicId: v.id("topics"),
    score: v.number(),
    accuracy: v.number(),
    timeTakenSeconds: v.number(),
    startedAt: v.number(),
    completedAt: v.number(),
    answers: v.array(
      v.object({
        questionId: v.id("questions"),
        selectedOptionIndex: v.number(),
        isCorrect: v.boolean(),
        timeSpentSeconds: v.number(),
      })
    ),
  },
  handler: async (ctx, args): Promise<{ success: boolean; attemptId: Id<"attempts"> }> => {
    // 1. Save attempt
    const attemptId: Id<"attempts"> = await ctx.runMutation(
      api.attempts.saveAttempt,
      {
        userId: args.userId,
        examId: args.examId,     // ✅ fixed
        score: args.score,
        accuracy: args.accuracy,
        timeTakenSeconds: args.timeTakenSeconds,
        startedAt: args.startedAt,
        completedAt: args.completedAt,
      }
    );

    // 2. Save individual answers
    await ctx.runMutation(api.attempts.saveAttemptAnswers, {
      attemptId,
      answers: args.answers,
    });

    // 3. Update topic stats
    const correct = args.answers.filter((a) => a.isCorrect).length;
    await ctx.runMutation(api.attempts.updateTopicStats, {
      userId: args.userId,
      topicId: args.topicId,
      attempted: args.answers.length,
      correct,
    });

    return { success: true, attemptId };
  },
});

// ─── Get quizzes taken ────────────────────────────────────────────────────────
export const getQuizzesTaken = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("attempts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    return attempts.length;
  },
});

// ─── Get overall accuracy ─────────────────────────────────────────────────────
export const getOverallAccuracy = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("attempts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    if (attempts.length === 0) return 0;
    const total = attempts.reduce((sum, a) => sum + a.accuracy, 0);
    return Math.round(total / attempts.length);
  },
});

// ─── Get current streak ───────────────────────────────────────────────────────
export const getCurrentStreak = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("attempts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    if (attempts.length === 0) return 0;

    const days = new Set(
      attempts.map((a) =>
        new Date(a.completedAt).toISOString().split("T")[0]
      )
    );

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      if (days.has(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  },
});

// ─── Get achievements ─────────────────────────────────────────────────────────
export const getAchievements = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("attempts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const achievements: string[] = [];
    if (attempts.length === 0) return achievements;

    const totalAttempts = attempts.length;
    const avgAccuracy =
      attempts.reduce((sum, a) => sum + a.accuracy, 0) / totalAttempts;

    const days = new Set(
      attempts.map((a) =>
        new Date(a.completedAt).toISOString().split("T")[0]
      )
    );
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      if (days.has(date.toISOString().split("T")[0])) {
        streak++;
      } else if (i > 0) break;
    }

    if (totalAttempts >= 1)   achievements.push("🎯 First Quiz");
    if (totalAttempts >= 10)  achievements.push("📚 10 Quizzes");
    if (totalAttempts >= 50)  achievements.push("🏆 50 Quizzes");
    if (totalAttempts >= 100) achievements.push("💎 100 Quizzes");
    if (avgAccuracy >= 70)    achievements.push("✅ 70% Accuracy");
    if (avgAccuracy >= 85)    achievements.push("🎯 85% Accuracy");
    if (avgAccuracy >= 95)    achievements.push("🌟 95% Accuracy");
    if (streak >= 3)          achievements.push("🔥 3 Day Streak");
    if (streak >= 7)          achievements.push("⚡ 7 Day Streak");
    if (streak >= 30)         achievements.push("🚀 30 Day Streak");

    return achievements;
  },
});

// ─── Get recent activity ──────────────────────────────────────────────────────
export const getRecentActivity = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("attempts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(10);

    const result = await Promise.all(
      attempts.map(async (attempt) => {
        const firstAnswer = await ctx.db
          .query("attemptAnswers")
          .withIndex("by_attempt", (q) => q.eq("attemptId", attempt._id))
          .first();

        const topic = firstAnswer
          ? await ctx.db
              .query("questions")
              .filter((q) => q.eq(q.field("_id"), firstAnswer.questionId))
              .first()
              .then((question) =>
                question ? ctx.db.get(question.topicId) : null
              )
          : null;

        return {
          topicName: topic?.name ?? "Quiz",
          score: attempt.score,
          total: 10,
          accuracy: attempt.accuracy,
          completedAt: attempt.completedAt,
        };
      })
    );

    return result;
  },
});

// ─── Get subject wise accuracy ────────────────────────────────────────────────
export const getSubjectAccuracy = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const topicStats = await ctx.db
      .query("userTopicStats")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    if (topicStats.length === 0) return [];

    const subjectMap = new Map<string, {
      name: string;
      totalAttempted: number;
      totalCorrect: number;
    }>();

    for (const stat of topicStats) {
      const topic = await ctx.db.get(stat.topicId);
      if (!topic) continue;
      const subject = await ctx.db.get(topic.subjectId);
      if (!subject) continue;

      const existing = subjectMap.get(subject._id) ?? {
        name: subject.name,
        totalAttempted: 0,
        totalCorrect: 0,
      };

      subjectMap.set(subject._id, {
        name: existing.name,
        totalAttempted: existing.totalAttempted + stat.attempted,
        totalCorrect: existing.totalCorrect + stat.correct,
      });
    }

    return Array.from(subjectMap.values()).map((s) => ({
      subject: s.name,
      accuracy: Math.round((s.totalCorrect / s.totalAttempted) * 100),
      attempted: s.totalAttempted,
    }));
  },
});

// ─── Get score trend (last 10 attempts) ──────────────────────────────────────
export const getScoreTrend = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("attempts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(10);

    return attempts.reverse().map((a, i) => ({
      attempt: i + 1,
      accuracy: a.accuracy,
      score: a.score,
      date: new Date(a.completedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
    }));
  },
});

// ─── Get weak vs strong topics ────────────────────────────────────────────────
export const getWeakStrongTopics = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const topicStats = await ctx.db
      .query("userTopicStats")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const result = await Promise.all(
      topicStats.map(async (stat) => {
        const topic = await ctx.db.get(stat.topicId);
        const subject = topic ? await ctx.db.get(topic.subjectId) : null;
        return {
          topicName: topic?.name ?? "Unknown",
          subjectName: subject?.name ?? "Unknown",
          accuracy: stat.accuracyPercentage,
          attempted: stat.attempted,
        };
      })
    );

    const sorted = result
      .filter((t) => t.attempted >= 1)
      .sort((a, b) => b.accuracy - a.accuracy);

    return {
      strong: sorted.slice(0, 5),
      weak: sorted.slice(-5).reverse(),
    };
  },
});