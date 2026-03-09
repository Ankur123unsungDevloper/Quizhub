import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const upsertProfile = mutation({
  args: {
    userId: v.id("users"),

    preferredName: v.optional(v.string()),

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
      .first()

    if (existing) {

      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      })

      return existing._id
    }

    return await ctx.db.insert("userProfiles", {
      ...args,
      updatedAt: Date.now(),
    })
  }
});

export const getProfileByUserId = query({
  args: {
    userId: v.id("users")
  },

  handler: async (ctx, args) => {

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first()

    return profile
  }
});