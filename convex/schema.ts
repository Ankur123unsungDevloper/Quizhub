import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // To define users of the platform, allowing for authentication, role-based access control, and personalized experiences
  users: defineTable({
    clerkId: v.optional(v.string()),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("student"), v.literal("admin")),
    createdAt: v.number(),
  })
  .index("by_clerk", ["clerkId"])
  .index("by_email", ["email"]),

  // To store additional profile information for users, allowing for personalized learning paths and better user experience
  userProfiles: defineTable({
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

    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  
  // To define exams, allowing for categorization and organization of questions based on different types of exams
  exams: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("school"),
      v.literal("competitive"),
      v.literal("college")
    ),
    imageUrl: v.optional(v.string()), // ✅ new
    viewCount: v.optional(v.number()), // ✅ new
    createdAt: v.number(),
  }).index("by_category", ["category"]),

  // Update subjects table — add imageUrl
  subjects: defineTable({
    examId: v.id("exams"),
    name: v.string(),
    imageUrl: v.optional(v.string()), // ✅ new
    viewCount: v.optional(v.number()), // ✅ new
  }).index("by_exam", ["examId"]),

  // Update topics table — add imageUrl
  topics: defineTable({
    name: v.string(),
    description: v.optional(v.string()),  // ← add this line
    subjectId: v.id("subjects"),
    imageUrl: v.optional(v.string()),
    viewCount: v.optional(v.number()),
    difficultyWeight: v.number(),
  }).index("by_subject", ["subjectId"]),

  // To store questions for exams, allowing for structured question management and retrieval based on various criteria
  questions: defineTable({
    examId: v.id("exams"),
    subjectId: v.id("subjects"),
    topicId: v.id("topics"),

    questionText: v.string(),
    options: v.array(v.string()),

    correctOptionIndex: v.number(),

    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),

    explanation: v.string(),
    aiGenerated: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_exam", ["examId"])
    .index("by_topic", ["topicId"])
    .index("by_difficulty", ["difficulty"]),
  
  // To define tests which are specific sets of questions for users to attempt, allowing for structured practice and assessment
  tests: defineTable({
    examId: v.id("exams"),
    name: v.string(),

    mode: v.union(
      v.literal("practice"),
      v.literal("simulation"),
      v.literal("adaptive")
    ),

    totalQuestions: v.number(),
    durationMinutes: v.number(),
    negativeMarking: v.boolean(),

    createdAt: v.number(),
  }).index("by_exam", ["examId"]),

  // To associate questions with tests, allowing for dynamic test generation and management
  testQuestions: defineTable({
    testId: v.id("tests"),
    questionId: v.id("questions"),
  })
    .index("by_test", ["testId"])
    .index("by_question", ["questionId"]),
  
  // To track user attempts and performance on tests for analytics and personalized feedback
  attempts: defineTable({
    userId: v.id("users"),
    examId: v.id("exams"),

    score: v.number(),
    accuracy: v.number(),
    timeTakenSeconds: v.number(),

    startedAt: v.number(),
    completedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_exam", ["examId"]),
  
  // To store detailed answer data for analytics and personalized feedback
  attemptAnswers: defineTable({
    attemptId: v.id("attempts"),
    questionId: v.id("questions"),

    selectedOptionIndex: v.number(),
    isCorrect: v.boolean(),
    timeSpentSeconds: v.number(),
  })
    .index("by_attempt", ["attemptId"])
    .index("by_question", ["questionId"]),
  
  // To track user performance on each topic for personalized recommendations
  userTopicStats: defineTable({
    userId: v.id("users"),
    topicId: v.id("topics"),

    attempted: v.number(),
    correct: v.number(),
    accuracyPercentage: v.number(),

    lastUpdated: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_topic", ["topicId"]),
  
  // For logging AI question generation details
  aiGenerationLogs: defineTable({
    questionId: v.optional(v.id("questions")),

    tokensUsed: v.number(),
    generationTimeMs: v.number(),

    status: v.union(
      v.literal("success"),
      v.literal("failed")
    ),

    createdAt: v.number(),
  }).index("by_status", ["status"]),

  // Add to your existing schema
  agentLogs: defineTable({
    runAt: v.number(),
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
  }).index("by_status", ["status"]),


  paperExamSubmissions: defineTable({
    // Who submitted
    userId: v.id("users"),
    topicId: v.id("topics"),
    examId: v.id("exams"),

    // The generated question paper (stored as JSON so we can grade against it)
    questionPaper: v.array(
      v.object({
        questionNumber: v.number(),
        questionText: v.string(),
        marks: v.number(),           // marks allocated to this question
        modelAnswer: v.string(),     // AI-generated ideal answer for grading
        type: v.union(
          v.literal("short"),        // 2-3 lines
          v.literal("long"),         // full paragraph
          v.literal("numerical"),    // calculation based
          v.literal("diagram"),      // draw and label
        ),
      })
    ),
    totalMarks: v.number(),          // sum of all question marks

    // Student's submission
    fileUrl: v.string(),             // Cloudinary URL of uploaded answer sheet
    fileType: v.union(v.literal("image"), v.literal("pdf")),
    submittedAt: v.number(),
    timeTakenSeconds: v.number(),

    // Grading status
    status: v.union(
      v.literal("submitted"),        // uploaded, not yet graded
      v.literal("grading"),          // Gemini is processing
      v.literal("graded"),           // result ready
      v.literal("failed"),           // grading failed, can retry
    ),

    // Result (filled after grading)
    marksObtained: v.optional(v.number()),
    percentage: v.optional(v.number()),
    feedback: v.optional(
      v.array(
        v.object({
          questionNumber: v.number(),
          marksAwarded: v.number(),
          maxMarks: v.number(),
          studentAnswer: v.string(),   // what Gemini extracted from handwriting
          feedback: v.string(),        // "Good explanation but missed the formula"
          modelAnswer: v.string(),     // shown for comparison
        })
      )
    ),
    gradedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),
  
  aibookPages: defineTable({
    bookId: v.string(),
    userId: v.string(),
    title: v.string(),
    pageNumber: v.number(),
    text: v.string(),
  }).index("by_book", ["bookId"]),
});