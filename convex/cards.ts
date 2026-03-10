import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// ─── Update image URL after generation ───────────────────────────────────────
export const updateImageUrl = mutation({
  args: {
    entityType: v.union(
      v.literal("exam"),
      v.literal("subject"),
      v.literal("topic")
    ),
    entityId: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.entityType === "exam") {
      await ctx.db.patch(args.entityId as Id<"exams">, {
        imageUrl: args.imageUrl,
      });
    } else if (args.entityType === "subject") {
      await ctx.db.patch(args.entityId as Id<"subjects">, {
        imageUrl: args.imageUrl,
      });
    } else {
      await ctx.db.patch(args.entityId as Id<"topics">, {
        imageUrl: args.imageUrl,
      });
    }
  },
});

// ─── Increment view count ─────────────────────────────────────────────────────
export const incrementViewCount = mutation({
  args: {
    entityType: v.union(
      v.literal("exam"),
      v.literal("subject"),
      v.literal("topic")
    ),
    entityId: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.entityType === "exam") {
      const doc = await ctx.db.get(args.entityId as Id<"exams">);
      if (!doc) return;
      await ctx.db.patch(args.entityId as Id<"exams">, {
        viewCount: (doc.viewCount ?? 0) + 1,
      });
    } else if (args.entityType === "subject") {
      const doc = await ctx.db.get(args.entityId as Id<"subjects">);
      if (!doc) return;
      await ctx.db.patch(args.entityId as Id<"subjects">, {
        viewCount: (doc.viewCount ?? 0) + 1,
      });
    } else {
      const doc = await ctx.db.get(args.entityId as Id<"topics">);
      if (!doc) return;
      await ctx.db.patch(args.entityId as Id<"topics">, {
        viewCount: (doc.viewCount ?? 0) + 1,
      });
    }
  },
});

// ─── Get random mixed cards for home page ────────────────────────────────────
export const getRandomCards = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    const allExams = await ctx.db.query("exams").collect();
    const allSubjects = await ctx.db.query("subjects").collect();
    const allTopics = await ctx.db.query("topics").collect();

    const examCards = allExams.map((e) => ({
      _id: e._id as string,
      name: e.name,
      description: e.description,
      imageUrl: e.imageUrl,
      viewCount: e.viewCount,
      category: e.category,
      cardType: "exam" as const,
    }));

    const subjectCards = allSubjects.map((s) => ({
      _id: s._id as string,
      name: s.name,
      description: undefined as string | undefined,
      imageUrl: s.imageUrl,
      viewCount: s.viewCount,
      category: undefined as string | undefined,
      cardType: "subject" as const,
    }));

    const topicCards = allTopics.map((t) => ({
      _id: t._id as string,
      name: t.name,
      description: undefined as string | undefined,
      imageUrl: t.imageUrl,
      viewCount: t.viewCount,
      category: undefined as string | undefined,
      difficultyWeight: t.difficultyWeight,
      cardType: "topic" as const,
    }));

    const allCards = [...examCards, ...subjectCards, ...topicCards];

    // Shuffle randomly
    const shuffled = allCards.sort(() => Math.random() - 0.5);

    return shuffled.slice(0, limit);
  },
});

// ─── Get card detail by id and type ──────────────────────────────────────────
export const getCardDetail = query({
  args: {
    entityType: v.union(
      v.literal("exam"),
      v.literal("subject"),
      v.literal("topic")
    ),
    entityId: v.string(),
  },
  handler: async (ctx, args) => {

    if (args.entityType === "exam") {
      const doc = await ctx.db.get(args.entityId as Id<"exams">);
      if (!doc) return null;
      return {
        ...doc,
        _id: doc._id as string,
        cardType: "exam" as const,
        parentName: undefined as string | undefined,
        examName: undefined as string | undefined,
      };
    }

    if (args.entityType === "subject") {
      const doc = await ctx.db.get(args.entityId as Id<"subjects">);
      if (!doc) return null;
      const exam = await ctx.db.get(doc.examId);
      return {
        ...doc,
        _id: doc._id as string,
        cardType: "subject" as const,
        parentName: exam?.name,
        examName: undefined as string | undefined,
      };
    }

    // topic
    const doc = await ctx.db.get(args.entityId as Id<"topics">);
    if (!doc) return null;
    const subject = await ctx.db.get(doc.subjectId);
    const exam = subject ? await ctx.db.get(subject.examId) : null;
    return {
      ...doc,
      _id: doc._id as string,
      cardType: "topic" as const,
      parentName: subject?.name,
      examName: exam?.name,
    };
  },
});