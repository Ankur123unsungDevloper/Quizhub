/* eslint-disable @typescript-eslint/no-unused-vars */
import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// ─── Check if user is admin ───────────────────────────────────────────────────
export const isAdmin = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .first();
    return user?.role === "admin";
  },
});

// ─── Set user as admin ────────────────────────────────────────────────────────
export const setAdminRole = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .first();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, { role: "admin" });
  },
});

// ─── Create exam manually ─────────────────────────────────────────────────────
export const createExam = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("school"),
      v.literal("competitive"),
      v.literal("college")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("exams", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// ─── Create subject manually ──────────────────────────────────────────────────
export const createSubject = mutation({
  args: {
    examId: v.id("exams"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("subjects", { ...args });
  },
});

// ─── Create topic manually ────────────────────────────────────────────────────
export const createTopic = mutation({
  args: {
    subjectId: v.id("subjects"),
    name: v.string(),
    difficultyWeight: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("topics", { ...args });
  },
});

// ─── Delete exam ──────────────────────────────────────────────────────────────
export const deleteExam = mutation({
  args: { examId: v.id("exams") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.examId);
  },
});

// ─── Delete subject ───────────────────────────────────────────────────────────
export const deleteSubject = mutation({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.subjectId);
  },
});

// ─── Delete topic ─────────────────────────────────────────────────────────────
export const deleteTopic = mutation({
  args: { topicId: v.id("topics") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.topicId);
  },
});

// ─── Get all students ─────────────────────────────────────────────────────────
export const getAllStudents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "student"))
      .collect();
  },
});

// ─── Get dashboard stats ──────────────────────────────────────────────────────
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const exams = await ctx.db.query("exams").collect();
    const subjects = await ctx.db.query("subjects").collect();
    const topics = await ctx.db.query("topics").collect();
    const users = await ctx.db.query("users").collect();
    const attempts = await ctx.db.query("attempts").collect();
    const aiLogs = await ctx.db.query("aiGenerationLogs").collect();

    const successfulGenerations = aiLogs.filter(
      (l) => l.status === "success"
    ).length;

    return {
      totalExams: exams.length,
      totalSubjects: subjects.length,
      totalTopics: topics.length,
      totalStudents: users.filter((u) => u.role === "student").length,
      totalAttempts: attempts.length,
      aiGenerations: successfulGenerations,
    };
  },
});

// ─── Get agent run logs ───────────────────────────────────────────────────────
export const getAgentLogs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("agentLogs")
      .order("desc")
      .take(20);
  },
});

// ─── Get all exams with counts ────────────────────────────────────────────────
export const getAllExamsWithCounts = query({
  args: {},
  handler: async (ctx) => {
    const exams = await ctx.db.query("exams").collect();

    const result = await Promise.all(
      exams.map(async (exam) => {
        const subjects = await ctx.db
          .query("subjects")
          .withIndex("by_exam", (q) => q.eq("examId", exam._id))
          .collect();

        const topicCounts = await Promise.all(
          subjects.map((s) =>
            ctx.db
              .query("topics")
              .withIndex("by_subject", (q) => q.eq("subjectId", s._id))
              .collect()
              .then((t) => t.length)
          )
        );

        return {
          ...exam,
          subjectCount: subjects.length,
          topicCount: topicCounts.reduce((a, b) => a + b, 0),
        };
      })
    );

    return result;
  },
});

// ─── Get all subjects with counts ─────────────────────────────────────────────
export const getAllSubjectsWithCounts = query({
  args: {},
  handler: async (ctx) => {
    const subjects = await ctx.db.query("subjects").collect();

    const result = await Promise.all(
      subjects.map(async (subject) => {
        const exam = await ctx.db.get(subject.examId);
        const topics = await ctx.db
          .query("topics")
          .withIndex("by_subject", (q) => q.eq("subjectId", subject._id))
          .collect();

        return {
          ...subject,
          examName: exam?.name ?? "Unknown",
          topicCount: topics.length,
        };
      })
    );

    return result;
  },
});

// ─── Get all topics with subject and exam name ────────────────────────────────
export const getAllTopicsWithDetails = query({
  args: {},
  handler: async (ctx) => {
    const topics = await ctx.db.query("topics").collect();

    const result = await Promise.all(
      topics.map(async (topic) => {
        const subject = await ctx.db.get(topic.subjectId);
        const exam = subject ? await ctx.db.get(subject.examId) : null;

        return {
          ...topic,
          subjectName: subject?.name ?? "Unknown",
          examName: exam?.name ?? "Unknown",
        };
      })
    );

    return result;
  },
});

// ─── Edit exam ────────────────────────────────────────────────────────────────
export const editExam = mutation({
  args: {
    examId: v.id("exams"),
    name: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("school"),
      v.literal("competitive"),
      v.literal("college")
    ),
  },
  handler: async (ctx, args) => {
    const { examId, ...rest } = args;
    await ctx.db.patch(examId, rest);
  },
});

// ─── Edit subject ─────────────────────────────────────────────────────────────
export const editSubject = mutation({
  args: {
    subjectId: v.id("subjects"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.subjectId, { name: args.name });
  },
});

// ─── Edit topic ───────────────────────────────────────────────────────────────
export const editTopic = mutation({
  args: {
    topicId: v.id("topics"),
    name: v.string(),
    difficultyWeight: v.number(),
  },
  handler: async (ctx, args) => {
    const { topicId, ...rest } = args;
    await ctx.db.patch(topicId, rest);
  },
});

// ─── Bulk delete exams ────────────────────────────────────────────────────────
export const bulkDeleteExams = mutation({
  args: { examIds: v.array(v.id("exams")) },
  handler: async (ctx, args) => {
    for (const examId of args.examIds) {
      await ctx.db.delete(examId);
    }
  },
});

// ─── Bulk delete subjects ─────────────────────────────────────────────────────
export const bulkDeleteSubjects = mutation({
  args: { subjectIds: v.array(v.id("subjects")) },
  handler: async (ctx, args) => {
    for (const subjectId of args.subjectIds) {
      await ctx.db.delete(subjectId);
    }
  },
});

// ─── Bulk delete topics ───────────────────────────────────────────────────────
export const bulkDeleteTopics = mutation({
  args: { topicIds: v.array(v.id("topics")) },
  handler: async (ctx, args) => {
    for (const topicId of args.topicIds) {
      await ctx.db.delete(topicId);
    }
  },
});

// ─── Get all students with stats ──────────────────────────────────────────────
export const getAllStudentsWithStats = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "student"))
      .collect();

    const result = await Promise.all(
      users.map(async (user) => {
        const attempts = await ctx.db
          .query("attempts")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const totalAttempts = attempts.length;
        const avgAccuracy =
          totalAttempts > 0
            ? Math.round(
                attempts.reduce((sum, a) => sum + a.accuracy, 0) /
                  totalAttempts
              )
            : 0;

        const lastActive =
          attempts.length > 0
            ? Math.max(...attempts.map((a) => a.completedAt))
            : user.createdAt;

        return {
          _id: user._id as string,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          totalAttempts,
          avgAccuracy,
          lastActive,
        };
      })
    );

    return result;
  },
});

// ─── Seed initial data (run once) ────────────────────────────────────────────
export const seedInitialData = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("exams").first();
    if (existing) return { message: "Data already exists" };

    // JEE Main
    const jeeId = await ctx.db.insert("exams", {
      name: "JEE Main",
      description: "Joint Entrance Examination for NIT, IIIT and GFTI admissions",
      category: "competitive",
      createdAt: Date.now(),
    });

    const physicsId = await ctx.db.insert("subjects", {
      examId: jeeId,
      name: "Physics",
    });
    const chemId = await ctx.db.insert("subjects", {
      examId: jeeId,
      name: "Chemistry",
    });
    const mathId = await ctx.db.insert("subjects", {
      examId: jeeId,
      name: "Mathematics",
    });

    const physicsTopics = [
      "Kinematics", "Laws of Motion", "Work Energy Power",
      "Rotational Motion", "Gravitation", "Thermodynamics",
      "Waves", "Electrostatics", "Current Electricity", "Optics"
    ];
    const chemTopics = [
      "Atomic Structure", "Chemical Bonding", "Equilibrium",
      "Electrochemistry", "Organic Chemistry Basics",
      "Hydrocarbons", "Coordination Compounds",
      "p-Block Elements", "d-Block Elements", "Polymers"
    ];
    const mathTopics = [
      "Sets and Functions", "Trigonometry", "Complex Numbers",
      "Matrices", "Permutations", "Binomial Theorem",
      "Sequences and Series", "Straight Lines", "Calculus", "Vectors"
    ];

    for (const topic of physicsTopics) {
      await ctx.db.insert("topics", {
        subjectId: physicsId,
        name: topic,
        difficultyWeight: Math.floor(Math.random() * 5) + 4,
      });
    }
    for (const topic of chemTopics) {
      await ctx.db.insert("topics", {
        subjectId: chemId,
        name: topic,
        difficultyWeight: Math.floor(Math.random() * 5) + 3,
      });
    }
    for (const topic of mathTopics) {
      await ctx.db.insert("topics", {
        subjectId: mathId,
        name: topic,
        difficultyWeight: Math.floor(Math.random() * 5) + 4,
      });
    }

    // NEET
    const neetId = await ctx.db.insert("exams", {
      name: "NEET",
      description: "National Eligibility cum Entrance Test for MBBS and BDS admissions",
      category: "competitive",
      createdAt: Date.now(),
    });

    const bioId = await ctx.db.insert("subjects", {
      examId: neetId,
      name: "Biology",
    });
    const neetPhysicsId = await ctx.db.insert("subjects", {
      examId: neetId,
      name: "Physics",
    });
    const neetChemId = await ctx.db.insert("subjects", {
      examId: neetId,
      name: "Chemistry",
    });

    const bioTopics = [
      "Cell Biology", "Genetics", "Evolution",
      "Plant Physiology", "Human Physiology", "Reproduction",
      "Ecology", "Biotechnology", "Biomolecules", "Microbes"
    ];

    for (const topic of bioTopics) {
      await ctx.db.insert("topics", {
        subjectId: bioId,
        name: topic,
        difficultyWeight: Math.floor(Math.random() * 4) + 3,
      });
    }
    for (const topic of physicsTopics.slice(0, 8)) {
      await ctx.db.insert("topics", {
        subjectId: neetPhysicsId,
        name: topic,
        difficultyWeight: Math.floor(Math.random() * 4) + 3,
      });
    }
    for (const topic of chemTopics.slice(0, 8)) {
      await ctx.db.insert("topics", {
        subjectId: neetChemId,
        name: topic,
        difficultyWeight: Math.floor(Math.random() * 4) + 3,
      });
    }

    // Class 12 Boards
    const boardsId = await ctx.db.insert("exams", {
      name: "Class 12 Boards",
      description: "CBSE Class 12 Board Examinations",
      category: "school",
      createdAt: Date.now(),
    });

    const boardPhysicsId = await ctx.db.insert("subjects", {
      examId: boardsId,
      name: "Physics",
    });
    const boardMathId = await ctx.db.insert("subjects", {
      examId: boardsId,
      name: "Mathematics",
    });
    const englishId = await ctx.db.insert("subjects", {
      examId: boardsId,
      name: "English",
    });

    for (const topic of physicsTopics.slice(0, 8)) {
      await ctx.db.insert("topics", {
        subjectId: boardPhysicsId,
        name: topic,
        difficultyWeight: Math.floor(Math.random() * 3) + 2,
      });
    }
    for (const topic of mathTopics.slice(0, 8)) {
      await ctx.db.insert("topics", {
        subjectId: boardMathId,
        name: topic,
        difficultyWeight: Math.floor(Math.random() * 3) + 2,
      });
    }

    const englishTopics = [
      "Reading Comprehension", "Writing Skills",
      "Grammar", "Literature", "Poetry"
    ];
    for (const topic of englishTopics) {
      await ctx.db.insert("topics", {
        subjectId: englishId,
        name: topic,
        difficultyWeight: 3,
      });
    }

    return {
      message: "Seeded successfully",
      exams: 3,
      subjects: 9,
      topics: 79,
    };
  },
});

// ─── Get all cards missing images ─────────────────────────────────────────────
export const getCardsNeedingImages = query({
  args: {},
  handler: async (ctx) => {
    const exams = await ctx.db.query("exams").collect();
    const subjects = await ctx.db.query("subjects").collect();
    const topics = await ctx.db.query("topics").collect();

    return {
      exams: exams
        .filter((e) => !e.imageUrl)
        .map((e) => ({
          id: e._id as string,
          name: e.name,
          category: e.category,
          type: "exam" as const,
        })),
      subjects: subjects
        .filter((s) => !s.imageUrl)
        .map((s) => ({
          id: s._id as string,
          name: s.name,
          type: "subject" as const,
        })),
      topics: topics
        .filter((t) => !t.imageUrl)
        .map((t) => ({
          id: t._id as string,
          name: t.name,
          type: "topic" as const,
        })),
    };
  },
});

export const debugCounts = query({
  args: {},
  handler: async (ctx) => {
    const exams = await ctx.db.query("exams").collect();
    const subjects = await ctx.db.query("subjects").collect();
    const topics = await ctx.db.query("topics").collect();

    return {
      exams: exams.length,
      examsSample: exams.slice(0, 2).map(e => ({
        name: e.name,
        hasImage: !!e.imageUrl
      })),
      subjects: subjects.length,
      topics: topics.length,
    };
  },
});

// ─── Add these queries to convex/admin.ts ────────────────────────────────────
// These are PUBLIC read queries (no admin check needed) for the quizzes page

// Get all exams — for exam tabs
export const getAllExams = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("exams").order("asc").collect();
  },
});

// Get subjects by exam — for subject filter pills
export const getSubjectsByExam = query({
  args: { examId: v.id("exams") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subjects")
      .withIndex("by_exam", (q) => q.eq("examId", args.examId))
      .collect();
  },
});

// Get all topics for an exam (via subjects join) — for topic cards grid
export const getTopicsByExam = query({
  args: { examId: v.id("exams") },
  handler: async (ctx, args) => {
    const subjects = await ctx.db
      .query("subjects")
      .withIndex("by_exam", (q) => q.eq("examId", args.examId))
      .collect();

    const subjectIds = new Set(subjects.map((s) => s._id));

    const allTopics = await Promise.all(
      subjects.map((s) =>
        ctx.db
          .query("topics")
          .withIndex("by_subject", (q) => q.eq("subjectId", s._id))
          .collect()
      )
    );

    return allTopics.flat();
  },
});

// ── Add these to the bottom of convex/admin.ts ───────────────────────────────
// getAllExams and getTopicsByExam already exist — only add these two new ones:

// Returns a topic + its parent examId (needed by exam page for saveExamResult)
export const getTopicWithExam = query({
  args: { topicId: v.id("topics") },
  handler: async (ctx, args) => {
    const topic = await ctx.db.get(args.topicId);
    if (!topic) return null;
    const subject = await ctx.db.get(topic.subjectId);
    if (!subject) return null;
    return {
      _id: topic._id,
      name: topic.name,
      description: topic.description,
      imageUrl: topic.imageUrl,
      subjectId: topic.subjectId,
      examId: subject.examId,   // ← this is what the exam page needs
    };
  },
});

// Returns all questions for a topic (exam page uses this)
export const getQuestionsByTopic = query({
  args: { topicId: v.id("topics") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_topic", (q) => q.eq("topicId", args.topicId))
      .collect();
  },
});