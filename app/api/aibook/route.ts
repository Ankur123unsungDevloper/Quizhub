import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import Groq from "groq-sdk";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, bookId, bookTitle } = body;

    const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === "user");
    const userQuestion = lastUserMessage?.content ?? "";

    const keywords = userQuestion
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(" ")
      .filter((w: string) => w.length > 3)
      .slice(0, 3);

    const foundPages: { pageNumber: number; text: string }[] = [];

    if (bookId) {
      for (const keyword of keywords) {
        const results = await convex.query(api.aibook.searchBookPages, {
          bookId,
          keyword,
        });
        for (const result of results) {
          if (!foundPages.find((p) => p.pageNumber === result.pageNumber)) {
            foundPages.push(result);
          }
        }
      }
      foundPages.sort((a, b) => a.pageNumber - b.pageNumber);
    }

    const systemPrompt = bookId && foundPages.length > 0
      ? `You are an AI assistant helping a student study "${bookTitle}".
Here are relevant excerpts from the book:

${foundPages.map((p) => `--- Page ${p.pageNumber} ---\n${p.text}`).join("\n\n")}

Answer using ONLY the above content. Always cite the page number(s).
If not found in excerpts, say "I couldn't find this in the provided pages."`
      : `You are an AI assistant helping a student study "${bookTitle ?? "their book"}".
Answer based on your general knowledge of the subject.`;

    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    });

    const assistantText = result.choices[0]?.message?.content ?? "Sorry, I couldn't generate a response.";

    return NextResponse.json({ content: [{ text: assistantText }] });

  } catch (error) {
    console.error("AIBook chat error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
