"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

async function fetchPexelsImage(query: string, apiKey: string): Promise<string> {
  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
    { headers: { Authorization: apiKey } }
  );
  if (!response.ok) throw new Error(`Pexels API ${response.status}`);
  const data = await response.json();
  if (!data.photos || data.photos.length === 0) {
    const seed = query.length % 1000;
    return `https://picsum.photos/seed/${seed}/800/450`;
  }
  return data.photos[0].src.large;
}

// ─── Run this multiple times until all topics are done ────────────────────────
// Each run processes 150 topics (~2.5 min, well under 10 min limit)
// Call it from dashboard repeatedly until it returns { remaining: 0 }
export const fixBatch = action({
  args: {
    batchSize: v.optional(v.number()), // default 150
  },
  handler: async (ctx, args): Promise<{ processed: number; failed: number; remaining: number }> => {
    const PEXELS_API_KEY = process.env.PEXELS_API_KEY!;
    if (!PEXELS_API_KEY) throw new Error("PEXELS_API_KEY not set in Convex env");

    const batchSize = args.batchSize ?? 150;
    const topics = await ctx.runQuery(internal.imageFixHelpers.getTopicsWithoutImages, {});
    const batch = topics.slice(0, batchSize);

    console.log(`Processing ${batch.length} topics (${topics.length} total remaining)`);

    let processed = 0;
    let failed = 0;

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    for (let i = 0; i < batch.length; i++) {
      const topic = batch[i];
      try {
        const query = topic.examName
          ? `${topic.name} ${topic.examName}`
          : `${topic.name} education`;

        const imageUrl = await fetchPexelsImage(query, PEXELS_API_KEY);

        await ctx.runMutation(internal.cards.updateImageUrl, {
          topicId: topic._id as Id<"topics">,
          imageUrl,
        });

        console.log(`✅ [${i + 1}/${batch.length}] ${topic.name}`);
        processed++;
        await sleep(1000); // 1 req/sec = stays within 200 req/hr limit

      } catch (err) {
        console.error(`❌ "${topic.name}":`, err);
        failed++;
        await sleep(1000);
      }
    }

    const remaining = topics.length - processed;
    console.log(`Batch done. Processed: ${processed}, Failed: ${failed}, Remaining: ${remaining}`);
    return { processed, failed, remaining };
  },
});