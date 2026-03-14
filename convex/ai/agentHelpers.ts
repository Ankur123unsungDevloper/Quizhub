// NO "use node" here — only internalQuery and internalMutation allowed

import { internalQuery, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

// ─── Get all existing exam names ──────────────────────────────────────────────
export const getExistingExamNames = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("exams").collect();
  },
});

// ─── Get subjects with fewer than 5 topics ────────────────────────────────────
export const getSubjectsWithLowTopics = internalQuery({
  args: {},
  handler: async (ctx) => {
    const subjects = await ctx.db.query("subjects").collect();
    const result = [];

    for (const subject of subjects) {
      const topics = await ctx.db
        .query("topics")
        .withIndex("by_subject", (q) => q.eq("subjectId", subject._id))
        .collect();

      if (topics.length < 5) {
        const exam = await ctx.db.get(subject.examId);
        result.push({
          subjectId: subject._id,
          subjectName: subject.name,
          examId: subject.examId,
          examName: exam?.name ?? "Unknown",
          topicCount: topics.length,
        });
      }
    }

    return result;
  },
});

// ─── Get topics with no questions ─────────────────────────────────────────────
export const getTopicsWithNoQuestions = internalQuery({
  args: {},
  handler: async (ctx) => {
    const topics = await ctx.db.query("topics").collect();
    const result = [];

    for (const topic of topics) {
      const questions = await ctx.db
        .query("questions")
        .withIndex("by_topic", (q) => q.eq("topicId", topic._id))
        .first();

      if (!questions) {
        const subject = await ctx.db.get(topic.subjectId);
        const exam = subject ? await ctx.db.get(subject.examId) : null;
        result.push({
          topicId: topic._id,
          topicName: topic.name,
          subjectId: topic.subjectId,
          subjectName: subject?.name ?? "Unknown",
          examId: exam?._id,
          examName: exam?.name ?? "Unknown",
        });
      }
    }

    return result;
  },
});

// ─── Get topics/cards with no imageUrl ───────────────────────────────────────
// Returns shape expected by agent.ts: { entityType, entityId, entityName, category }
export const getCardsWithNoImages = internalQuery({
  args: {},
  handler: async (ctx) => {
    const topics = await ctx.db.query("topics").collect();
    const result = [];

    for (const topic of topics) {
      if (!topic.imageUrl) {
        const subject = await ctx.db.get(topic.subjectId);
        const exam = subject ? await ctx.db.get(subject.examId) : null;

        result.push({
          entityType: "topic" as const,
          entityId: topic._id as string,
          entityName: topic.name,
          category: exam?.name ?? subject?.name ?? "General",
        });
      }
    }

    // Limit to 5 per run to avoid Pollinations rate issues
    return result.slice(0, 5);
  },
});

// ─── Get low quality questions (less than 4 options) ─────────────────────────
export const getLowQualityQuestions = internalQuery({
  args: {},
  handler: async (ctx) => {
    const questions = await ctx.db.query("questions").collect();
    return questions
      .filter((q) => !q.options || q.options.length < 4)
      .slice(0, 10)
      .map((q) => ({ questionId: q._id }));
  },
});

// ─── Delete a low quality question ───────────────────────────────────────────
export const deleteLowQualityQuestion = internalMutation({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.questionId);
  },
});

// ─── Create agent log entry ───────────────────────────────────────────────────
export const createAgentLog = internalMutation({
  args: {
    status: v.union(v.literal("running"), v.literal("completed"), v.literal("failed")),
    summary: v.string(),
    examsAdded: v.number(),
    topicsAdded: v.number(),
    questionsGenerated: v.number(),
    imagesGenerated: v.number(),
    issuesFixed: v.number(),
  },
  handler: async (ctx, args): Promise<Id<"agentLogs">> => {
    return await ctx.db.insert("agentLogs", {
      ...args,
      runAt: Date.now(),
    });
  },
});

// ─── Update agent log ─────────────────────────────────────────────────────────
export const updateAgentLog = internalMutation({
  args: {
    logId: v.id("agentLogs"),
    status: v.union(v.literal("running"), v.literal("completed"), v.literal("failed")),
    summary: v.string(),
    examsAdded: v.number(),
    topicsAdded: v.number(),
    questionsGenerated: v.number(),
    imagesGenerated: v.number(),
    issuesFixed: v.number(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { logId, ...rest } = args;
    await ctx.db.patch(logId, { ...rest });
  },
});