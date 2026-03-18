import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── Check if user has active subscription ─────────────────────────────────
export const getUserSubscription = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();

    if (!sub) return null;
    if (sub.endDate < Date.now()) return null;

    return sub;
  }
});

export const isSubscribed = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();

    if (!sub) return false;
    return sub.endDate > Date.now();
  }
});

// ── Create subscription after successful payment ───────────────────────────
export const createSubscription = mutation({
  args: {
    userId: v.id("users"),
    plan: v.union(v.literal("basic"), v.literal("pro"), v.literal("elite")),
    razorpayPaymentId: v.string(),
    razorpaySubscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { status: "cancelled" });
    }

    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    return await ctx.db.insert("subscriptions", {
      userId: args.userId,
      plan: args.plan,
      razorpayPaymentId: args.razorpayPaymentId,
      razorpaySubscriptionId: args.razorpaySubscriptionId,
      status: "active",
      startDate: now,
      endDate: now + thirtyDays,
      createdAt: now,
    });
  }
});

// ── Cancel subscription ────────────────────────────────────────────────────
export const cancelSubscription = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();

    if (!sub) return null;

    await ctx.db.patch(sub._id, { status: "cancelled" });
    return sub._id;
  }
});

// ── Get premium cards — fixed query pattern ────────────────────────────────
export const getPremiumCards = query({
  args: {
    examId: v.optional(v.id("exams")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 3;

    // ✅ Use separate query paths — never reassign a query variable
    if (args.examId) {
      const cards = await ctx.db
        .query("premiumCards")
        .withIndex("by_exam", q => q.eq("examId", args.examId!))
        .filter(q => q.eq(q.field("isActive"), true))
        .collect();
      return cards.slice(0, limit);
    }

    const cards = await ctx.db
      .query("premiumCards")
      .filter(q => q.eq(q.field("isActive"), true))
      .collect();
    return cards.slice(0, limit);
  }
});

// ── Get full premium card content (only for subscribers) ──────────────────
export const getPremiumCardContent = query({
  args: {
    cardId: v.id("premiumCards"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .filter(q => q.eq(q.field("status"), "active"))
      .first();

    if (!sub || sub.endDate < Date.now()) {
      return { locked: true, card: null };
    }

    const card = await ctx.db.get(args.cardId);
    return { locked: false, card };
  }
});