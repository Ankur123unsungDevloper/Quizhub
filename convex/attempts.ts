import { mutation, action, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// ─── Save full attempt ────────────────────────────────────────────────────────
export const saveAttempt = mutation({
  args: {
    userId: v.id("users"),
    testId: v.id("tests"),
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
    testId: v.id("tests"),
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
  handler: async (ctx, args): Promise<{ success: boolean; attemptId: Id<"attempts"> }> => { // ✅ return type added
    // 1. Save attempt
    const attemptId: Id<"attempts"> = await ctx.runMutation( // ✅ type added
      api.attempts.saveAttempt,
      {
        userId: args.userId,
        testId: args.testId,
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

    // Get unique days with activity
    const days = new Set(
      attempts.map((a) =>
        new Date(a.completedAt).toISOString().split("T")[0]
      )
    );

    // Count consecutive days from today
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      if (days.has(dateStr)) {
        streak++;
      } else if (i > 0) {
        // Allow today to be empty (streak not broken yet)
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

    // Streak
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

    // Award achievements
    if (totalAttempts >= 1)  achievements.push("🎯 First Quiz");
    if (totalAttempts >= 10) achievements.push("📚 10 Quizzes");
    if (totalAttempts >= 50) achievements.push("🏆 50 Quizzes");
    if (totalAttempts >= 100) achievements.push("💎 100 Quizzes");
    if (avgAccuracy >= 70) achievements.push("✅ 70% Accuracy");
    if (avgAccuracy >= 85) achievements.push("🎯 85% Accuracy");
    if (avgAccuracy >= 95) achievements.push("🌟 95% Accuracy");
    if (streak >= 3)  achievements.push("🔥 3 Day Streak");
    if (streak >= 7)  achievements.push("⚡ 7 Day Streak");
    if (streak >= 30) achievements.push("🚀 30 Day Streak");

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
        // ✅ Get answers for this attempt → get first question → get topic
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