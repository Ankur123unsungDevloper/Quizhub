/* eslint-disable @typescript-eslint/no-unused-vars */
import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

// ─── Known popular Indian exams ───────────────────────────────────────────────
export const POPULAR_EXAM_NAMES = [
  "JEE Main", "JEE Advanced", "NEET", "GATE",
  "UPSC Prelims", "CAT", "SSC CGL", "Bank PO",
  "Railway NTPC", "NDA", "CLAT", "CUET",
  "Class 10 Boards", "Class 12 Boards",
  "Class 9", "Class 11", "BCA", "B.Tech CSE", "MBA",
];

// ─── Get existing exam names ──────────────────────────────────────────────────
export const getExistingExamNames = internalQuery({
  args: {},
  handler: async (ctx) => {
    const exams = await ctx.db.query("exams").collect();
    return exams.map((e) => ({ id: e._id, name: e.name }));
  },
});

// ─── Get subjects with low topics ─────────────────────────────────────────────
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

      if (topics.length < 8) {
        const exam = await ctx.db.get(subject.examId);
        result.push({
          subjectId: subject._id,
          subjectName: subject.name,
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
        .collect();

      if (questions.length === 0) {
        const subject = await ctx.db.get(topic.subjectId);
        const exam = subject ? await ctx.db.get(subject.examId) : null;
        result.push({
          topicId: topic._id,
          topicName: topic.name,
          subjectName: subject?.name ?? "Unknown",
          examName: exam?.name ?? "Unknown",
          subjectId: topic.subjectId,
          examId: exam?._id,
        });
      }
    }

    return result.slice(0, 5);
  },
});

// ─── Get cards with no images ─────────────────────────────────────────────────
export const getCardsWithNoImages = internalQuery({
  args: {},
  handler: async (ctx) => {
    const exams = await ctx.db.query("exams").collect();
    const subjects = await ctx.db.query("subjects").collect();
    const topics = await ctx.db.query("topics").collect();

    const missingImages: {
      entityType: "exam" | "subject" | "topic";
      entityId: string;
      entityName: string;
      category: string | undefined;
    }[] = [];

    for (const exam of exams.filter((e) => !e.imageUrl)) {
      missingImages.push({
        entityType: "exam",
        entityId: exam._id as string,
        entityName: exam.name,
        category: exam.category,
      });
    }

    for (const subject of subjects.filter((s) => !s.imageUrl)) {
      missingImages.push({
        entityType: "subject",
        entityId: subject._id as string,
        entityName: subject.name,
        category: undefined,
      });
    }

    for (const topic of topics.filter((t) => !t.imageUrl)) {
      missingImages.push({
        entityType: "topic",
        entityId: topic._id as string,
        entityName: topic.name,
        category: undefined,
      });
    }

    return missingImages.slice(0, 5);
  },
});

// ─── Get low quality questions ────────────────────────────────────────────────
export const getLowQualityQuestions = internalQuery({
  args: {},
  handler: async (ctx) => {
    const questions = await ctx.db.query("questions").collect();
    return questions
      .filter(
        (q) =>
          q.questionText.length < 20 ||
          q.explanation.length < 10 ||
          q.options.length < 4
      )
      .slice(0, 10)
      .map((q) => ({ questionId: q._id }));
  },
});

// ─── Delete low quality question ──────────────────────────────────────────────
export const deleteLowQualityQuestion = internalMutation({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.questionId);
  },
});

// ─── Create agent log ─────────────────────────────────────────────────────────
export const createAgentLog = internalMutation({
  args: {
    status: v.union(
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed")
    ),
    summary: v.string(),
    examsAdded: v.number(),
    topicsAdded: v.number(),
    questionsGenerated: v.number(),
    imagesGenerated: v.number(),
    issuesFixed: v.number(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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
    status: v.union(
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed")
    ),
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
    await ctx.db.patch(logId, rest);
  },
});