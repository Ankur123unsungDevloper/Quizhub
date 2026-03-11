"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";

type TopicData = {
  name: string;
  difficultyWeight: number;
};

type SubjectData = {
  name: string;
  topics: TopicData[];
};

type ExamStructure = {
  name: string;
  description: string;
  category: "school" | "competitive" | "college";
  subjects: SubjectData[];
};

export const generateExamStructure = action({
  args: {
    prompt: v.string(), // e.g. "Create JEE Main with Physics Chemistry Maths"
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    examId: Id<"exams">;
    subjectsCreated: number;
    topicsCreated: number;
  }> => {

    // 1. Call Gemini to generate full structure
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const structurePrompt = `
You are an expert Indian education curriculum designer.

Based on this request: "${args.prompt}"

Generate a complete exam structure with all subjects and topics.

Rules:
1. Generate realistic topics that actually appear in this exam
2. difficultyWeight must be 1-10 (1=easiest, 10=hardest)
3. Each subject must have at least 8-12 topics
4. Description must be clear and informative
5. Category must be one of: school, competitive, college

Return ONLY valid JSON, no markdown, no backticks:
{
  "name": "exam name",
  "description": "detailed description",
  "category": "competitive",
  "subjects": [
    {
      "name": "subject name",
      "topics": [
        { "name": "topic name", "difficultyWeight": 5 }
      ]
    }
  ]
}
`;

    const result = await model.generateContent(structurePrompt);
    const rawText = result.response.text();

    // 2. Clean and parse
    const cleaned = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const structure: ExamStructure = JSON.parse(cleaned);

    // 3. Create exam in Convex
    const examId: Id<"exams"> = await ctx.runMutation(
      api.admin.createExam,
      {
        name: structure.name,
        description: structure.description,
        category: structure.category,
      }
    );

    // 4. Create subjects and topics
    let subjectsCreated = 0;
    let topicsCreated = 0;

    for (const subject of structure.subjects) {
      const subjectId: Id<"subjects"> = await ctx.runMutation(
        api.admin.createSubject,
        {
          examId,
          name: subject.name,
        }
      );
      subjectsCreated++;

      for (const topic of subject.topics) {
        await ctx.runMutation(api.admin.createTopic, {
          subjectId,
          name: topic.name,
          difficultyWeight: topic.difficultyWeight,
        });
        topicsCreated++;
      }
    }

    // 5. Trigger image generation for exam
    await ctx.runAction(api.ai.generateImage.generateAndStoreImage, {
      entityType: "exam",
      entityId: examId,
      entityName: structure.name,
      category: structure.category,
    });

    return {
      success: true,
      examId,
      subjectsCreated,
      topicsCreated,
    };
  },
});