import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bookId = formData.get("bookId") as string;
    const userId = formData.get("userId") as string;
    const title = formData.get("title") as string;

    if (!file || !bookId || !userId || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const pdfData = await pdfParse(buffer);

    const rawPages: string[] = pdfData.text.split(/\f/);

    const pages = rawPages
      .map((text: string, index: number) => ({
        pageNumber: index + 1,
        text: text.trim(),
      }))
      .filter((p: { pageNumber: number; text: string }) => p.text.length > 10);

    await convex.mutation(api.aibook.storeBookPages, {
      bookId,
      userId,
      title,
      pages,
    });

    return NextResponse.json({
      success: true,
      totalPages: pages.length,
      totalChars: pdfData.text.length,
    });

  } catch (error) {
    console.error("PDF extraction error:", error);
    return NextResponse.json({ error: "Failed to process PDF" }, { status: 500 });
  }
}