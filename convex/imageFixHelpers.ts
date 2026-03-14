// NO "use node" — queries only

import { internalQuery } from "./_generated/server";

export const getTopicsWithoutImages = internalQuery({
  args: {},
  handler: async (ctx) => {
    const topics = await ctx.db.query("topics").collect();

    // Replace missing, broken, or placeholder images
    const needsFix = topics.filter((t) =>
      !t.imageUrl ||
      t.imageUrl.includes("pollinations.ai") ||
      t.imageUrl.includes("source.unsplash.com") ||
      t.imageUrl.includes("picsum.photos")
    );

    const enriched = await Promise.all(
      needsFix.map(async (topic) => {
        const subject = await ctx.db.get(topic.subjectId);
        const exam = subject ? await ctx.db.get(subject.examId) : null;
        return {
          _id: topic._id,
          name: topic.name,
          examName: exam?.name ?? null,
        };
      })
    );

    return enriched;
  },
});