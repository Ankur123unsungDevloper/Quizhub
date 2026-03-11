"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { v2 as cloudinary } from "cloudinary";

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

    const prompt = buildImagePrompt(args.entityName, args.entityType, args.category);

    // ── 1. Call Stability AI (new v2beta endpoint) ─────────────────────────
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("output_format", "webp");
    formData.append("width", "1024");
    formData.append("height", "512");

    const stabilityResponse = await fetch(
      "https://api.stability.ai/v2beta/stable-image/generate/core",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: "image/*",
        },
        body: formData,
      }
    );

    if (!stabilityResponse.ok) {
      const errorText = await stabilityResponse.text();
      throw new Error(`Stability AI error ${stabilityResponse.status}: ${errorText}`);
    }

    // ── 2. Convert response to base64 ──────────────────────────────────────
    const imageBuffer = await stabilityResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    // ── 3. Upload to Cloudinary ────────────────────────────────────────────
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const uploadResult = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        cloudinary.uploader.upload(
          `data:image/webp;base64,${base64Image}`,
          {
            folder: "quizhub",
            public_id: `${args.entityType}_${args.entityId}`,
            overwrite: true,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as { secure_url: string });
          }
        );
      }
    );

    // ── 4. Store URL in Convex ─────────────────────────────────────────────
    await ctx.runMutation(api.cards.updateImageUrl, {
      entityType: args.entityType,
      entityId: args.entityId,
      imageUrl: uploadResult.secure_url,
    });

    return { success: true, imageUrl: uploadResult.secure_url };
  },
});

// ─── Build smart prompt per entity ───────────────────────────────────────────
const buildImagePrompt = (
  name: string,
  type: string,
  category?: string
): string => {
  const style = "flat design illustration, vibrant colors, clean modern background, no text, no letters, professional educational banner";

  const subjectPrompts: Record<string, string> = {
    physics: "atomic particles, electromagnetic waves, physics equations visualization, blue energy field",
    chemistry: "molecular structures, chemical bonds, laboratory flask, periodic table elements, green emerald tones",
    mathematics: "geometric shapes, mathematical graphs, equations floating, purple abstract patterns",
    biology: "DNA helix, cell structure, nature leaves, green organic shapes",
    english: "open book, pen writing, literature, warm rose tones",
    history: "ancient architecture, timeline, golden amber tones",
    geography: "world map, topographic lines, blue green earth tones",
    computer: "circuit board, code symbols, dark tech aesthetic, glowing lines",
    economics: "graphs, charts, financial symbols, blue business aesthetic",
    reasoning: "brain neural network, logic puzzle, violet tones",
  };

  const nameLower = name.toLowerCase();

  // Check for subject match
  for (const [key, visual] of Object.entries(subjectPrompts)) {
    if (nameLower.includes(key)) {
      return `Professional educational banner for ${name}, ${visual}. ${style}`;
    }
  }

  // Exam specific
  if (type === "exam") {
    return `Professional educational banner for ${name} exam preparation, ${category ?? "academic"} competitive exam, students studying, achievement concept, orange gold tones. ${style}`;
  }

  // Topic fallback
  return `Professional educational banner for the topic "${name}", learning and knowledge concept, colorful abstract. ${style}`;
};