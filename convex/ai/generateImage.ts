"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";

async function fetchPexelsImage(query: string): Promise<string> {
  const PEXELS_API_KEY = process.env.PEXELS_API_KEY!;

  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
    {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.photos || data.photos.length === 0) {
    // Fallback: search just "education study" if specific query has no results
    const fallback = await fetch(
      `https://api.pexels.com/v1/search?query=education+study&per_page=15&orientation=landscape`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );
    const fallbackData = await fallback.json();
    // Pick a somewhat random photo from fallback results using query length as offset
    const index = query.length % (fallbackData.photos?.length ?? 1);
    return fallbackData.photos?.[index]?.src?.large ?? `https://picsum.photos/seed/${query.length}/800/450`;
  }

  // Return the large photo URL (800px wide)
  return data.photos[0].src.large;
}

export const generateAndStoreImage = action({
  args: {
    entityType: v.union(v.literal("topic"), v.literal("exam"), v.literal("subject")),
    entityId: v.string(),
    entityName: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<string> => {
    const { entityType, entityId, entityName, category } = args;

    // Build a meaningful search query
    const query = category
      ? `${entityName} ${category}`
      : `${entityName} education`;

    const imageUrl = await fetchPexelsImage(query);

    if (entityType === "topic") {
      await ctx.runMutation(internal.cards.updateImageUrl, {
        topicId: entityId as Id<"topics">,
        imageUrl,
      });
    }

    console.log(`✅ Pexels image stored for "${entityName}": ${imageUrl}`);
    return imageUrl;
  },
});