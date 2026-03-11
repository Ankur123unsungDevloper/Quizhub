"use node";

import { internalAction, action } from "../_generated/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { internal, api } from "../_generated/api";
import { Id } from "../_generated/dataModel";

const POPULAR_EXAMS = [
  { name: "JEE Main", category: "competitive" as const },
  { name: "JEE Advanced", category: "competitive" as const },
  { name: "NEET", category: "competitive" as const },
  { name: "GATE", category: "competitive" as const },
  { name: "UPSC Prelims", category: "competitive" as const },
  { name: "CAT", category: "competitive" as const },
  { name: "SSC CGL", category: "competitive" as const },
  { name: "Bank PO", category: "competitive" as const },
  { name: "Railway NTPC", category: "competitive" as const },
  { name: "NDA", category: "competitive" as const },
  { name: "CLAT", category: "competitive" as const },
  { name: "CUET", category: "competitive" as const },
  { name: "Class 10 Boards", category: "school" as const },
  { name: "Class 12 Boards", category: "school" as const },
  { name: "Class 9", category: "school" as const },
  { name: "Class 11", category: "school" as const },
  { name: "BCA", category: "college" as const },
  { name: "B.Tech CSE", category: "college" as const },
  { name: "MBA", category: "college" as const },
];

// ─── Main autonomous agent ────────────────────────────────────────────────────
export const runAutonomousAgent = internalAction({
  args: {},
  handler: async (ctx): Promise<void> => {

    const logId: Id<"agentLogs"> = await ctx.runMutation(
      internal.ai.agentHelpers.createAgentLog,
      {
        status: "running",
        summary: "Agent started",
        examsAdded: 0,
        topicsAdded: 0,
        questionsGenerated: 0,
        imagesGenerated: 0,
        issuesFixed: 0,
      }
    );

    const stats = {
      examsAdded: 0,
      topicsAdded: 0,
      questionsGenerated: 0,
      imagesGenerated: 0,
      issuesFixed: 0,
    };

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    // ─── Sleep helper ─────────────────────────────────────────────────────────────
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    try {

      // ── Task 1: Add missing popular exams ──────────────────────────────────
      const existingExams = await ctx.runQuery(
        internal.ai.agentHelpers.getExistingExamNames, {}
      );
      const existingNames = existingExams.map((e) =>
        e.name.toLowerCase()
      );

      const missingExams = POPULAR_EXAMS.filter(
        (e) => !existingNames.includes(e.name.toLowerCase())
      );

      for (const missingExam of missingExams.slice(0, 2)) {
        try {
          const structurePrompt = `
Generate a complete exam structure for ${missingExam.name}.
Return ONLY valid JSON, no markdown, no backticks:
{
  "name": "${missingExam.name}",
  "description": "detailed description",
  "category": "${missingExam.category}",
  "subjects": [
    {
      "name": "subject name",
      "topics": [
        { "name": "topic name", "difficultyWeight": 5 }
      ]
    }
  ]
}
Each subject must have 8-12 realistic topics.
`;
          const result = await model.generateContent(structurePrompt);
          const rawText = result.response.text();
          const cleaned = rawText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

          const structure = JSON.parse(cleaned);

          const examId: Id<"exams"> = await ctx.runMutation(
            api.admin.createExam,
            {
              name: structure.name,
              description: structure.description,
              category: structure.category,
            }
          );

          for (const subject of structure.subjects) {
            const subjectId: Id<"subjects"> = await ctx.runMutation(
              api.admin.createSubject,
              { examId, name: subject.name }
            );

            for (const topic of subject.topics) {
              await ctx.runMutation(api.admin.createTopic, {
                subjectId,
                name: topic.name,
                difficultyWeight: topic.difficultyWeight,
              });
              stats.topicsAdded++;
            }
          }

          stats.examsAdded++;
          await sleep(4000);

        } catch (err) {
          console.error(`Failed to create ${missingExam.name}:`, err);
        }
      }

      // ── Task 2: Add missing topics to subjects ─────────────────────────────
      const lowTopicSubjects = await ctx.runQuery(
        internal.ai.agentHelpers.getSubjectsWithLowTopics, {}
      );

      for (const subject of lowTopicSubjects.slice(0, 3)) {
        try {
          const topicsPrompt = `
Generate 5 additional unique topics for subject "${subject.subjectName}" 
in exam "${subject.examName}".
Return ONLY valid JSON array, no markdown:
[{ "name": "topic name", "difficultyWeight": 5 }]
`;
          const result = await model.generateContent(topicsPrompt);
          const rawText = result.response.text();
          const cleaned = rawText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

          const topics = JSON.parse(cleaned);

          for (const topic of topics) {
            await ctx.runMutation(api.admin.createTopic, {
              subjectId: subject.subjectId,
              name: topic.name,
              difficultyWeight: topic.difficultyWeight,
            });
            stats.topicsAdded++;
            await sleep(4000);
          }
        } catch (err) {
          console.error(`Failed to add topics to ${subject.subjectName}:`, err);
        }
      }

      // ── Task 3: Generate questions for empty topics ────────────────────────
      const emptyTopics = await ctx.runQuery(
        internal.ai.agentHelpers.getTopicsWithNoQuestions, {}
      );

      for (const topic of emptyTopics) {
        try {
          if (!topic.examId) continue;

          await ctx.runAction(
            api.ai.generateQuestions.generateAndStoreQuestions,
            {
              examId: topic.examId as Id<"exams">,
              subjectId: topic.subjectId as Id<"subjects">,
              topicId: topic.topicId as Id<"topics">,
              examName: topic.examName,
              subjectName: topic.subjectName,
              topicName: topic.topicName,
              difficulty: "medium",
              count: 10,
            }
          );

          stats.questionsGenerated += 10;
          console.log(`✅ Questions generated for ${topic.topicName}`);

          // ✅ Wait 4 seconds between each Gemini call
          await sleep(4000);

        } catch (err) {
          console.error(`❌ Questions failed for ${topic.topicName}:`, err);
          // Wait even longer after a failure before retrying next topic
          await sleep(8000);
        }
      }

      // ── Task 4: Generate missing images ────────────────────────────────────
      const missingImages = await ctx.runQuery(
        internal.ai.agentHelpers.getCardsWithNoImages, {}
      );

      console.log(`Found ${missingImages.length} cards needing images`);

      for (const card of missingImages) {
        try {
          await ctx.runAction(
            api.ai.generateImage.generateAndStoreImage,
            {
              entityType: card.entityType,
              entityId: card.entityId,
              entityName: card.entityName,
              category: card.category,
            }
          );
          stats.imagesGenerated++;
          console.log(`✅ Image generated for ${card.entityName}`);
        } catch (err) {
          console.error(`❌ Image failed for ${card.entityName}:`, err);
        }
      }

      // ── Task 5: Fix low quality questions ─────────────────────────────────
      const lowQuality = await ctx.runQuery(
        internal.ai.agentHelpers.getLowQualityQuestions, {}
      );

      for (const q of lowQuality) {
        try {
          await ctx.runMutation(
            internal.ai.agentHelpers.deleteLowQualityQuestion,
            { questionId: q.questionId }
          );
          stats.issuesFixed++;
        } catch (err) {
          console.error(`Failed to delete low quality question:`, err);
        }
      }

      // ── Update log success ─────────────────────────────────────────────────
      const summary = `Agent completed. Exams: ${stats.examsAdded}, Topics: ${stats.topicsAdded}, Questions: ${stats.questionsGenerated}, Images: ${stats.imagesGenerated}, Fixed: ${stats.issuesFixed}`;

      await ctx.runMutation(internal.ai.agentHelpers.updateAgentLog, {
        logId,
        status: "completed",
        summary,
        ...stats,
      });

    } catch (error) {
      await ctx.runMutation(internal.ai.agentHelpers.updateAgentLog, {
        logId,
        status: "failed",
        summary: "Agent failed with error",
        ...stats,
        errorMessage:
          error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  },
});

// ─── Public action to manually trigger agent ─────────────────────────────────
export const triggerAgentManually = action({
  args: {},
  handler: async (ctx): Promise<void> => {
    await ctx.runAction(internal.ai.agent.runAutonomousAgent, {});
  },
});
