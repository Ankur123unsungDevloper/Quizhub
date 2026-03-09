import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get user by email
 */
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    return user;
  },
});

/**
 * Get user by Clerk ID
 */
export const getUserByClerkId = query({
  args: { clerkId: v.string() },

  handler: async (ctx, args) => {

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", q => q.eq("clerkId", args.clerkId))
      .first()

    return user
  }
})

/**
 * Sync Clerk user with Convex database
 */
export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
  },

  handler: async (ctx, args) => {

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk", q => q.eq("clerkId", args.clerkId))
      .first()

    if (existing) return existing

    const adminEmails = [
      "ankurdas1804@gmail.com"
    ]

    const role = adminEmails.includes(args.email)
      ? "admin"
      : "student"

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      role,
      createdAt: Date.now()
    })

    return await ctx.db.get(userId)
  }
})