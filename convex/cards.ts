/* eslint-disable @typescript-eslint/no-unused-vars */
import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// ─── Update image URL on a topic ──────────────────────────────────────────────
export const updateImageUrl = internalMutation({
  args: {
    topicId: v.id("topics"),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.topicId, { imageUrl: args.imageUrl });
  },
});

// ─── Increment view count for a topic ────────────────────────────────────────
export const incrementViewCount = mutation({
  args: { topicId: v.id("topics") },
  handler: async (ctx, args) => {
    const topic = await ctx.db.get(args.topicId);
    if (!topic) return;
    await ctx.db.patch(args.topicId, {
      viewCount: (topic.viewCount ?? 0) + 1,
    });
  },
});

// ─── Get random cards (topics) for the home page grid ─────────────────────────
export const getRandomCards = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const topics = await ctx.db.query("topics").collect();

    // Enrich each topic with subject/exam name
    const enriched = await Promise.all(
      topics.map(async (topic) => {
        const subject = await ctx.db.get(topic.subjectId);
        const exam = subject ? await ctx.db.get(subject.examId) : null;
        return {
          _id: topic._id,
          name: topic.name,
          description: topic.description,
          imageUrl: topic.imageUrl,
          viewCount: topic.viewCount ?? 0,
          difficultyWeight: topic.difficultyWeight,
          subjectId: topic.subjectId,
          examId: exam?._id,
          parentName: exam?.name ?? subject?.name ?? "",
        };
      })
    );

    // Shuffle and return up to `limit`
    const shuffled = enriched.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  },
});

// ─── Get full card detail (topic + subject + exam) ────────────────────────────
export const getCardDetail = query({
  args: { topicId: v.id("topics") },
  handler: async (ctx, args) => {
    const topic = await ctx.db.get(args.topicId);
    if (!topic) return null;

    const subject = await ctx.db.get(topic.subjectId);
    const exam = subject ? await ctx.db.get(subject.examId) : null;

    return {
      _id: topic._id,
      name: topic.name,
      description: topic.description,
      imageUrl: topic.imageUrl,
      viewCount: topic.viewCount ?? 0,
      difficultyWeight: topic.difficultyWeight,
      subjectId: topic.subjectId,
      examId: exam?._id,
      parentName: exam?.name ?? subject?.name ?? "",
    };
  },
});