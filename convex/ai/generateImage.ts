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

    // 1. Build prompt for Stability AI
    const prompt = buildImagePrompt(args.entityName, args.entityType, args.category);

    // 2. Call Stability AI
    const stabilityResponse = await fetch(
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: prompt,
              weight: 1,
            },
            {
              // Negative prompt — what to avoid
              text: "blurry, low quality, text, watermark, ugly, distorted",
              weight: -1,
            },
          ],
          cfg_scale: 7,
          height: 512,
          width: 1024,
          samples: 1,
          steps: 30,
        }),
      }
    );

    if (!stabilityResponse.ok) {
      throw new Error(`Stability AI error: ${stabilityResponse.statusText}`);
    }

    const stabilityData = await stabilityResponse.json();
    const base64Image = stabilityData.artifacts[0].base64;

    // 3. Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // 4. Upload to Cloudinary
    const uploadResult = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        cloudinary.uploader.upload(
          `data:image/png;base64,${base64Image}`,
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

    const imageUrl = uploadResult.secure_url;

    // 5. Store URL back in Convex
    await ctx.runMutation(api.cards.updateImageUrl, {
      entityType: args.entityType,
      entityId: args.entityId,
      imageUrl,
    });

    return { success: true, imageUrl };
  },
});

// ─── Helper: Build image prompt ───────────────────────────────────────────────
const buildImagePrompt = (
  name: string,
  type: string,
  category?: string
): string => {
  const base = `A modern, professional, educational banner image for "${name}"`;
  const style = "flat design illustration, vibrant colors, clean background, no text";

  if (type === "exam") {
    return `${base} exam preparation, ${category ?? "academic"} category. ${style}`;
  }
  if (type === "subject") {
    return `${base} academic subject, educational concept art. ${style}`;
  }
  return `${base} study topic, learning concept. ${style}`;
};