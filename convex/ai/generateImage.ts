"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

export const generateAndStoreImage = action({
  args: {
    entityType: v.union(
      v.literal("exam"),
      v.literal("subject"),
      v.literal("topic")
    ),
    entityId: v.string(),
    entityName: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; imageUrl: string }> => {

    const prompt = buildImagePrompt(
      args.entityName,
      args.entityType,
      args.category
    );

    // ✅ Pollinations generates image on-demand when URL is loaded
    // No API call needed — just build the URL and store it
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=512&nologo=true&model=flux`;

    await ctx.runMutation(api.cards.updateImageUrl, {
      entityType: args.entityType,
      entityId: args.entityId,
      imageUrl,
    });

    return { success: true, imageUrl };
  },
});

const buildImagePrompt = (
  name: string,
  type: string,
  category?: string
): string => {
  const style = "flat design illustration vibrant colors clean modern background no text no letters professional educational banner";

  const subjectPrompts: Record<string, string> = {
    physics:     "atomic particles electromagnetic waves blue energy field scientific",
    chemistry:   "molecular structures chemical bonds laboratory flask green emerald",
    mathematics: "geometric shapes mathematical graphs purple abstract patterns",
    biology:     "DNA helix cell structure nature leaves green organic",
    english:     "open book pen writing literature warm rose tones",
    history:     "ancient architecture timeline golden amber tones",
    geography:   "world map topographic lines blue green earth",
    computer:    "circuit board code symbols dark tech glowing lines",
    economics:   "graphs charts financial symbols blue business",
    reasoning:   "brain neural network logic puzzle violet tones",
  };

  const nameLower = name.toLowerCase();

  for (const [key, visual] of Object.entries(subjectPrompts)) {
    if (nameLower.includes(key)) {
      return `Educational banner ${name} ${visual} ${style}`;
    }
  }

  if (type === "exam") {
    return `Educational banner ${name} exam ${category ?? "academic"} achievement orange gold ${style}`;
  }

  return `Educational banner topic ${name} learning colorful abstract ${style}`;
};