/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const requireAuth = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity.subject;
};

export const createAttempt = mutation({
  args: {
    testId: v.id("tests"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const test = await ctx.db.get(args.testId);
    if (!test) {
      throw new Error("Test not found");
    }

    const attemptId = await ctx.db.insert("attempts", {
      userId,
      testId: args.testId,
      score: 0,
      accuracy: 0,
      timeTakenSeconds: 0,
      startedAt: Date.now(),
      completedAt: 0,
    });

    return attemptId;
  },
});

export const saveAnswer = mutation({
  args: {
    attemptId: v.id("attempts"),
    questionId: v.id("questions"),
    selectedOptionIndex: v.number(),
    timeSpentSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const attempt = await ctx.db.get(args.attemptId);
    if (!attempt) throw new Error("Attempt not found");
    if (attempt.userId !== userId)
      throw new Error("Unauthorized");

    const question = await ctx.db.get(args.questionId);
    if (!question) throw new Error("Question not found");

    const isCorrect =
      question.correctOptionIndex === args.selectedOptionIndex;

    return await ctx.db.insert("attemptAnswers", {
      attemptId: args.attemptId,
      questionId: args.questionId,
      selectedOptionIndex: args.selectedOptionIndex,
      isCorrect,
      timeSpentSeconds: args.timeSpentSeconds,
    });
  },
});

export const submitAttempt = mutation({
  args: {
    attemptId: v.id("attempts"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const attempt = await ctx.db.get(args.attemptId);
    if (!attempt) throw new Error("Attempt not found");
    if (attempt.userId !== userId)
      throw new Error("Unauthorized");

    const answers = await ctx.db
      .query("attemptAnswers")
      .withIndex("by_attempt", (q) =>
        q.eq("attemptId", args.attemptId)
      )
      .collect();

    const total = answers.length;
    const correct = answers.filter((a) => a.isCorrect).length;

    const accuracy = total === 0 ? 0 : (correct / total) * 100;

    const updatedAttempt = await ctx.db.patch(args.attemptId, {
      score: correct,
      accuracy,
      completedAt: Date.now(),
      timeTakenSeconds:
        Date.now() - attempt.startedAt,
    });

    return updatedAttempt;
  },
});

export const getUserAttempts = query({
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    return await ctx.db
      .query("attempts")
      .withIndex("by_user", (q) =>
        q.eq("userId", userId)
      )
      .order("desc")
      .collect();
  },
});