"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { FaArrowLeft, FaPlay } from "react-icons/fa";
import { MdQuiz } from "react-icons/md";

// ─── Type for card detail ─────────────────────────────────────────────────────
type CardDetail = {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  viewCount?: number;
  cardType: "exam" | "subject" | "topic";
  parentName?: string;
  examName?: string;
  category?: string;
  difficultyWeight?: number;
};

const CardDetailPage = () => {
  const params = useParams();
  const router = useRouter();

  const entityType = params.type as "exam" | "subject" | "topic";
  const entityId = params.id as string;

  const rawCard = useQuery(api.cards.getCardDetail, {
    entityType,
    entityId,
  });

  // Cast to proper type once loaded
  const card = rawCard as CardDetail | null | undefined;

  // ── Loading state ──
  if (card === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 gap-4">
        <div className="w-full max-w-2xl space-y-4 animate-pulse px-4">
          <div className="bg-zinc-800 h-64 rounded-2xl w-full" />
          <div className="bg-zinc-800 h-8 rounded w-1/2" />
          <div className="bg-zinc-800 h-4 rounded w-full" />
          <div className="bg-zinc-800 h-4 rounded w-4/5" />
        </div>
      </div>
    );
  }

  // ── Not found state ──
  if (!card) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950">
        <p className="text-zinc-400">Card not found.</p>
        <Button
          onClick={() => router.push("/")}
          className="mt-4"
          variant="outline"
        >
          Back to Home
        </Button>
      </div>
    );
  }

  // ── Derived values ──
  const groupLabel =
    card.parentName ??
    card.examName ??
    card.category ??
    entityType;

  const getQuizRoute = (): string => {
    if (entityType === "topic") return `/quiz/${entityId}`;
    return `/exams/${entityId}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4 py-10">
      <div className="w-full max-w-2xl space-y-6">

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-400 hover:text-white"
        >
          <FaArrowLeft className="size-4" />
          Back
        </Button>

        {/* Image */}
        <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-zinc-900">
          {card.imageUrl ? (
            <Image
              src={card.imageUrl}
              alt={card.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-orange-900 to-zinc-900 flex items-center justify-center">
              <MdQuiz className="text-white/20 size-20" />
            </div>
          )}
        </div>

        {/* Card Info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">

          {/* Group label */}
          <span className="text-xs text-[#FF8D28] font-semibold uppercase tracking-wider">
            {groupLabel}
          </span>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white">
            {card.name}
          </h1>

          {/* Description */}
          <p className="text-zinc-400 leading-relaxed">
            {card.description ??
              `Master ${card.name} with AI-generated questions tailored to your level.
              Each quiz session gives you unique questions so you never practice the same thing twice.`}
          </p>

          {/* Meta info */}
          <div className="flex flex-wrap gap-3 pt-2">
            {card.category && (
              <span className="text-xs bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full capitalize">
                {card.category}
              </span>
            )}
            {card.difficultyWeight && (
              <span className="text-xs bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full">
                Difficulty: {card.difficultyWeight}/10
              </span>
            )}
            {card.viewCount !== undefined && (
              <span className="text-xs bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full">
                👁 {card.viewCount} views
              </span>
            )}
          </div>

          {/* Start Quiz Button */}
          <Button
            onClick={() => router.push(getQuizRoute())}
            className="w-full bg-[#FF8D28] hover:bg-[#ff8d28d9] text-white text-lg py-6 mt-4"
          >
            <FaPlay className="size-4 mr-2" />
            {entityType === "topic" ? "Start Quiz" : "Explore Content"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CardDetailPage;