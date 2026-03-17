import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const upsertProfile = mutation({
  args: {
    userId: v.id("users"),
    preferredName: v.optional(v.string()),

    // ✅ Required — matches schema exactly
    educationType: v.union(
      v.literal("school"),
      v.literal("college"),
      v.literal("competitive")
    ),

    class: v.optional(v.string()),
    branch: v.optional(v.string()),
    targetExam: v.optional(v.string()),
    targetYear: v.optional(v.number()),
    strongSubjects: v.optional(v.string()),
    weakSubjects: v.optional(v.string()),
    studyHoursPerDay: v.optional(v.number()),
  },

  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        preferredName: args.preferredName,
        educationType: args.educationType,
        class: args.class,
        branch: args.branch,
        targetExam: args.targetExam,
        targetYear: args.targetYear,
        strongSubjects: args.strongSubjects,
        weakSubjects: args.weakSubjects,
        studyHoursPerDay: args.studyHoursPerDay,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("userProfiles", {
      userId: args.userId,
      preferredName: args.preferredName,
      educationType: args.educationType,
      class: args.class,
      branch: args.branch,
      targetExam: args.targetExam,
      targetYear: args.targetYear,
      strongSubjects: args.strongSubjects,
      weakSubjects: args.weakSubjects,
      studyHoursPerDay: args.studyHoursPerDay,
      updatedAt: Date.now(),
    });
  }
});

export const getProfileByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  }
});