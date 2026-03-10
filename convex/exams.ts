import { query } from "./_generated/server";
import { v } from "convex/values";

// Get exam by name
export const getExamByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("exams")
      .filter((q) =>
        q.eq(q.field("name"), args.name)
      )
      .first();
  },
});

// Get all subjects for an exam
export const getSubjectsByExam = query({
  args: { examId: v.id("exams") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subjects")
      .withIndex("by_exam", (q) => q.eq("examId", args.examId))
      .collect();
  },
});

// Get all topics for a subject
export const getTopicsBySubject = query({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("topics")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .collect();
  },
});

// Get all tests for an exam
export const getTestsByExam = query({
  args: { examId: v.id("exams") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tests")
      .withIndex("by_exam", (q) => q.eq("examId", args.examId))
      .collect();
  },
});

// Search across exams, subjects and topics
export const searchAll = query({
  args: { searchQuery: v.string() },
  handler: async (ctx, args) => {
    const q = args.searchQuery.toLowerCase().trim();
    if (!q) return { exams: [], subjects: [], topics: [] };

    const allExams = await ctx.db.query("exams").collect();
    const allSubjects = await ctx.db.query("subjects").collect();
    const allTopics = await ctx.db.query("topics").collect();

    const exams = allExams.filter((e) =>
      e.name.toLowerCase().includes(q)
    );
    const subjects = allSubjects.filter((s) =>
      s.name.toLowerCase().includes(q)
    );
    const topics = allTopics.filter((t) =>
      t.name.toLowerCase().includes(q)
    );

    return { exams, subjects, topics };
  },
});

// Get all topics for an exam in one query (production safe)
export const getAllTopicsByExam = query({
  args: { examId: v.id("exams") },
  handler: async (ctx, args) => {
    const subjects = await ctx.db
      .query("subjects")
      .withIndex("by_exam", (q) => q.eq("examId", args.examId))
      .collect();

    const topics = await Promise.all(
      subjects.map((subject) =>
        ctx.db
          .query("topics")
          .withIndex("by_subject", (q) => q.eq("subjectId", subject._id))
          .collect()
      )
    );

    return topics.flat();
  },
});

// Get all exams
export const getAllExams = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("exams").collect();
  },
});

// Get exams by category
export const getExamsByCategory = query({
  args: {
    category: v.union(
      v.literal("school"),
      v.literal("competitive"),
      v.literal("college")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("exams")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});