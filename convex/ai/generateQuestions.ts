"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import Groq from "groq-sdk";
import { api } from "../_generated/api";

export const generateAndStoreQuestions = action({
  args: {
    examId: v.id("exams"),
    subjectId: v.id("subjects"),
    topicId: v.id("topics"),
    examName: v.string(),
    subjectName: v.string(),
    topicName: v.string(),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
    count: v.number(),
  },

  handler: async (ctx, args) => {
    const startTime = Date.now();

    // ── Fetch existing questions to avoid repeats ──────────────────────────
    const existingQuestions = await ctx.runQuery(
      api.questions.getQuestionTextsByTopic,
      { topicId: args.topicId }
    );
    const previousTexts = existingQuestions.map(
      (q: { questionText: string }) => q.questionText
    );

    // ── Build prompt ───────────────────────────────────────────────────────
    const prompt = `Generate ${args.count} multiple choice questions for:
Exam: ${args.examName}
Subject: ${args.subjectName}
Topic: ${args.topicName}
Difficulty: ${args.difficulty}
${previousTexts.length > 0 ? `\nAvoid repeating these questions:\n${previousTexts.slice(0, 5).join("\n")}` : ""}

Rules:
- Each question must have exactly 4 options
- Only one correct answer
- Include a brief explanation
- Return ONLY a valid JSON array, no markdown, no backticks

Format:
[
  {
    "questionText": "question here",
    "options": ["A", "B", "C", "D"],
    "correctOptionIndex": 0,
    "difficulty": "${args.difficulty}",
    "explanation": "why this answer is correct"
  }
]`;

    // ── Call Groq ──────────────────────────────────────────────────────────
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

    let rawText = "";
    let status: "success" | "failed" = "failed";

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 4000,
      });

      rawText = completion.choices[0]?.message?.content ?? "";

      const cleaned = rawText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleaned);

      if (!Array.isArray(parsed)) {
        throw new Error("AI response is not a valid array");
      }

      // ── Store questions ────────────────────────────────────────────────
      for (const q of parsed) {
        await ctx.runMutation(api.questions.createQuestion, {
          examId: args.examId,
          subjectId: args.subjectId,
          topicId: args.topicId,
          questionText: q.questionText,
          options: q.options,
          correctOptionIndex: q.correctOptionIndex,
          difficulty: q.difficulty ?? args.difficulty,
          explanation: q.explanation,
          aiGenerated: true,
        });
      }

      status = "success";

      await ctx.runMutation(api.questions.logAIGeneration, {
        tokensUsed: rawText.length,
        generationTimeMs: Date.now() - startTime,
        status,
      });

      return { success: true, questionsGenerated: parsed.length };

    } catch (error) {
      console.error("AI generation failed:", error);

      await ctx.runMutation(api.questions.logAIGeneration, {
        tokensUsed: rawText.length,
        generationTimeMs: Date.now() - startTime,
        status: "failed",
      });

      throw new Error("Failed to generate questions. Please try again.");
    }
  },
});