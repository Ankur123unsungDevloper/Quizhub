import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Fetch question texts by topic — used to prevent AI repeating questions
export const getQuestionTextsByTopic = query({
  args: { topicId: v.id("topics") },
  handler: async (ctx, args) => {
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_topic", (q) => q.eq("topicId", args.topicId))
      .collect();

    return questions.map((q) => ({
      questionText: q.questionText,
    }));
  },
});

// Store a single AI generated question
export const createQuestion = mutation({
  args: {
    examId: v.id("exams"),
    subjectId: v.id("subjects"),
    topicId: v.id("topics"),
    questionText: v.string(),
    options: v.array(v.string()),
    correctOptionIndex: v.number(),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
    explanation: v.string(),
    aiGenerated: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("questions", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Log every AI generation attempt
export const logAIGeneration = mutation({
  args: {
    questionId: v.optional(v.id("questions")),
    tokensUsed: v.number(),
    generationTimeMs: v.number(),
    status: v.union(
      v.literal("success"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("aiGenerationLogs", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Fetch questions by topic for quiz display
export const getQuestionsByTopic = query({
  args: {
    topicId: v.id("topics"),
    difficulty: v.optional(
      v.union(
        v.literal("easy"),
        v.literal("medium"),
        v.literal("hard")
      )
    ),
  },
  handler: async (ctx, args) => {
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_topic", (q) => q.eq("topicId", args.topicId))
      .collect();

    // Filter by difficulty if provided
    if (args.difficulty) {
      return questions.filter((q) => q.difficulty === args.difficulty);
    }

    return questions;
  },
});

export const getTopicById = query({
  args: { topicId: v.id("topics") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.topicId);
  },
});

export const getTopicWithExam = query({
  args: { topicId: v.id("topics") },
  handler: async (ctx, args) => {
    const topic = await ctx.db.get(args.topicId);
    if (!topic) return null;

    const subject = await ctx.db.get(topic.subjectId);
    if (!subject) return null;

    return {
      ...topic,
      examId: subject.examId, // ← get examId from subject
      subjectId: topic.subjectId,
    };
  },
});