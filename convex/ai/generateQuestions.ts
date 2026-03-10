"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateQuestionsPrompt } from "./prompts";
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

    // 1. Fetch existing questions for this topic
    //    so AI never repeats them
    const existingQuestions = await ctx.runQuery(
      api.questions.getQuestionTextsByTopic,
      { topicId: args.topicId }
    );

    const previousTexts = existingQuestions.map(
      (q: { questionText: string }) => q.questionText
    );

    // 2. Build prompt
    const prompt = generateQuestionsPrompt(
      args.examName,
      args.subjectName,
      args.topicName,
      args.difficulty,
      args.count,
      previousTexts
    );

    // 3. Call Gemini Flash
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    let rawText = "";
    let status: "success" | "failed" = "failed";

    try {
      const result = await model.generateContent(prompt);
      rawText = result.response.text();

      // 4. Clean response — remove any markdown Gemini might add
      const cleaned = rawText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleaned);

      // 5. Validate parsed response is an array
      if (!Array.isArray(parsed)) {
        throw new Error("AI response is not a valid array");
      }

      // 6. Store each question in Convex
      for (const q of parsed) {
        await ctx.runMutation(api.questions.createQuestion, {
          examId: args.examId,
          subjectId: args.subjectId,
          topicId: args.topicId,
          questionText: q.questionText,
          options: q.options,
          correctOptionIndex: q.correctOptionIndex,
          difficulty: q.difficulty,
          explanation: q.explanation,
          aiGenerated: true,
        });
      }

      status = "success";

      // 7. Log success
      await ctx.runMutation(api.questions.logAIGeneration, {
        tokensUsed: rawText.length,
        generationTimeMs: Date.now() - startTime,
        status,
      });

      return {
        success: true,
        questionsGenerated: parsed.length,
      };

    } catch (error) {
      console.error("AI generation failed:", error);

      // Log failure
      await ctx.runMutation(api.questions.logAIGeneration, {
        tokensUsed: rawText.length,
        generationTimeMs: Date.now() - startTime,
        status: "failed",
      });

      throw new Error(
        "Failed to generate questions. Please try again."
      );
    }
  },
});