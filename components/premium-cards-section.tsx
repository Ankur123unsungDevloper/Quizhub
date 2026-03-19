"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PremiumCard } from "@/components/premium-card";
import { RiVipCrownFill } from "react-icons/ri";
import { HiSparkles } from "react-icons/hi";

type Props = {
  examId?: Id<"exams">;
};

export const PremiumCardsSection = ({ examId }: Props) => {
  const cards = useQuery(api.subscriptions.getPremiumCards, {
    examId,
    limit: 3,
  });

  if (!cards || cards.length === 0) return null;

  return (
    <div className="mt-12 space-y-4">
      {/* Section divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-linear-to-r from-transparent via-yellow-500/30 to-transparent" />
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
          <RiVipCrownFill className="size-4 text-yellow-400" />
          <span className="text-yellow-400 text-sm font-semibold">Premium Content</span>
          <HiSparkles className="size-4 text-yellow-400" />
        </div>
        <div className="flex-1 h-px bg-linear-to-r from-transparent via-yellow-500/30 to-transparent" />
      </div>

      <p className="text-center text-zinc-500 text-sm">
        Unlock exclusive content crafted by experts — go beyond free quizzes
      </p>

      {/* Premium cards grid — max 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <PremiumCard key={card._id} card={card} />
        ))}
      </div>
    </div>
  );
};