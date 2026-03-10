import { mutation, action } from "./_generated/server";
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