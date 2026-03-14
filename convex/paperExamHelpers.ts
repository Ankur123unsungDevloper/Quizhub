// NO "use node" — mutations and queries only

import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// ─── Save submission after student uploads PDF ───────────────────────────────
export const saveSubmission = mutation({
  args: {
    userId: v.id("users"),
    topicId: v.id("topics"),
    examId: v.id("exams"),
    questionPaper: v.array(
      v.object({
        questionNumber: v.number(),
        questionText: v.string(),
        marks: v.number(),
        modelAnswer: v.string(),
        type: v.union(
          v.literal("short"),
          v.literal("long"),
          v.literal("numerical"),
          v.literal("diagram"),
        ),
      })
    ),
    totalMarks: v.number(),
    fileUrl: v.string(),
    timeTakenSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    const submissionId = await ctx.db.insert("paperExamSubmissions", {
      userId: args.userId,
      topicId: args.topicId,
      examId: args.examId,
      questionPaper: args.questionPaper,
      totalMarks: args.totalMarks,
      fileUrl: args.fileUrl,
      fileType: "pdf",
      submittedAt: Date.now(),
      timeTakenSeconds: args.timeTakenSeconds,
      status: "submitted",
    });
    return submissionId;
  },
});

// ─── Internal: update grading status ─────────────────────────────────────────
export const setGradingStatus = internalMutation({
  args: {
    submissionId: v.id("paperExamSubmissions"),
    status: v.union(
      v.literal("submitted"),
      v.literal("grading"),
      v.literal("graded"),
      v.literal("failed"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.submissionId, { status: args.status });
  },
});

// ─── Internal: save grading result ───────────────────────────────────────────
export const saveGradingResult = internalMutation({
  args: {
    submissionId: v.id("paperExamSubmissions"),
    marksObtained: v.number(),
    percentage: v.number(),
    feedback: v.array(
      v.object({
        questionNumber: v.number(),
        marksAwarded: v.number(),
        maxMarks: v.number(),
        studentAnswer: v.string(),
        feedback: v.string(),
        modelAnswer: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.submissionId, {
      status: "graded",
      marksObtained: args.marksObtained,
      percentage: args.percentage,
      feedback: args.feedback,
      gradedAt: Date.now(),
    });
  },
});

// ─── Internal query: get submission by id ────────────────────────────────────
export const getSubmissionById = internalQuery({
  args: { submissionId: v.id("paperExamSubmissions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.submissionId);
  },
});

// ─── Public query: poll submission status (used by processing page) ───────────
export const getSubmissionStatus = query({
  args: { submissionId: v.id("paperExamSubmissions") },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.submissionId);
    if (!sub) return null;
    return {
      status: sub.status,
      marksObtained: sub.marksObtained,
      percentage: sub.percentage,
      totalMarks: sub.totalMarks,
      gradedAt: sub.gradedAt,
    };
  },
});

// ─── Public query: get full result for result page ────────────────────────────
export const getSubmissionResult = query({
  args: { submissionId: v.id("paperExamSubmissions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.submissionId);
  },
});

// ─── Public query: get user's past paper exam submissions ─────────────────────
export const getUserSubmissions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("paperExamSubmissions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});