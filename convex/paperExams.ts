/* eslint-disable @typescript-eslint/no-unused-vars */
"use node";

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import Groq from "groq-sdk";

// ─── Types ────────────────────────────────────────────────────────────────────
type PaperQuestion = {
  questionNumber: number;
  questionText: string;
  marks: number;
  modelAnswer: string;
  type: "short" | "long" | "numerical" | "diagram";
};

// ─── Generate question paper via Groq ────────────────────────────────────────
export const generateQuestionPaper = action({
  args: {
    topicId: v.id("topics"),
    examType: v.string(),
    subject: v.string(),
    topicName: v.string(),
    totalMarks: v.number(),
    durationMinutes: v.number(),
  },
  handler: async (ctx, args): Promise<PaperQuestion[]> => {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

    const prompt = `You are an experienced ${args.examType} question paper setter.

Generate a question paper for the topic "${args.topicName}" from subject "${args.subject}".

Requirements:
- Total marks: ${args.totalMarks}
- Duration: ${args.durationMinutes} minutes
- Follow exact ${args.examType} pattern and difficulty level
- Mix of short answer, long answer, and numerical questions (where applicable)
- Each question must have a clear, detailed model answer for grading purposes

Return ONLY a JSON array with this exact structure:
[
  {
    "questionNumber": 1,
    "questionText": "full question text here",
    "marks": 2,
    "modelAnswer": "detailed ideal answer that a student should write",
    "type": "short"
  }
]

Types allowed: "short" (1-3 marks), "long" (4-8 marks), "numerical" (calculation), "diagram" (draw and label)
Make sure total marks of all questions add up to exactly ${args.totalMarks}.
Return only valid JSON, no markdown, no explanation.`;

    const result = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.6,
      max_tokens: 4000,
    });

    const raw = result.choices[0]?.message?.content ?? "[]";
    const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const questions: PaperQuestion[] = JSON.parse(cleaned);
    return questions;
  },
});

// ─── Trigger grading ─────────────────────────────────────────────────────────
export const triggerGrading = action({
  args: { submissionId: v.id("paperExamSubmissions") },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.paperExamHelpers.setGradingStatus, {
      submissionId: args.submissionId,
      status: "grading",
    });
    await ctx.runAction(internal.paperExams.gradeSubmission, {
      submissionId: args.submissionId,
    });
  },
});

// ─── Internal: grade using Gemini Vision ─────────────────────────────────────
export const gradeSubmission = internalAction({
  args: { submissionId: v.id("paperExamSubmissions") },
  handler: async (ctx, args) => {
    const submission = await ctx.runQuery(
      internal.paperExamHelpers.getSubmissionById,
      { submissionId: args.submissionId }
    );

    if (!submission) {
      await ctx.runMutation(internal.paperExamHelpers.setGradingStatus, {
        submissionId: args.submissionId,
        status: "failed",
      });
      return;
    }

    try {
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

      const gradingPrompt = `You are an expert examiner. You will be given a scanned PDF of a student's handwritten answer sheet and a question paper with model answers.

Your task:
1. Read the student's handwritten answers carefully
2. Compare each answer against the model answer
3. Award marks fairly based on content accuracy, completeness, and understanding
4. Give specific one-line feedback per question

Question Paper:
${submission.questionPaper.map((q: { questionNumber: number; marks: number; questionText: string; modelAnswer: string }) =>
  `Q${q.questionNumber} [${q.marks} marks]: ${q.questionText}\n  Model Answer: ${q.modelAnswer}`
).join("\n\n")}

Return ONLY a JSON array like this:
[
  {
    "questionNumber": 1,
    "marksAwarded": 1.5,
    "maxMarks": 2,
    "studentAnswer": "what the student wrote (transcribed)",
    "feedback": "one sentence feedback"
  }
]

Be strict but fair. Partial credit is allowed. Return only valid JSON.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { file_data: { mime_type: "application/pdf", file_uri: submission.fileUrl } },
                { text: gradingPrompt },
              ],
            }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 4000 },
          }),
        }
      );

      const data = await response.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
      const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      const gradingResult = JSON.parse(cleaned);

      const marksObtained = gradingResult.reduce(
        (sum: number, q: { marksAwarded: number }) => sum + (q.marksAwarded ?? 0),
        0
      );
      const percentage = Math.round((marksObtained / submission.totalMarks) * 100);

      await ctx.runMutation(internal.paperExamHelpers.saveGradingResult, {
        submissionId: args.submissionId,
        marksObtained,
        percentage,
        feedback: gradingResult.map((q: {
          questionNumber: number;
          marksAwarded: number;
          studentAnswer: string;
          feedback: string;
        }) => ({
          questionNumber: q.questionNumber,
          marksAwarded: q.marksAwarded,
          maxMarks: submission.questionPaper.find(
            (p: { questionNumber: number }) => p.questionNumber === q.questionNumber
          )?.marks ?? 0,
          studentAnswer: q.studentAnswer,
          feedback: q.feedback,
          modelAnswer: submission.questionPaper.find(
            (p: { questionNumber: number }) => p.questionNumber === q.questionNumber
          )?.modelAnswer ?? "",
        })),
      });
    } catch (e) {
      console.error("Grading failed:", e);
      await ctx.runMutation(internal.paperExamHelpers.setGradingStatus, {
        submissionId: args.submissionId,
        status: "failed",
      });
    }
  },
});