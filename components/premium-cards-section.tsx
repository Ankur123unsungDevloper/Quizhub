/* eslint-disable @next/next/no-img-element */
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { RiVipCrownFill } from "react-icons/ri";
import { HiSparkles } from "react-icons/hi";
import { FaLock } from "react-icons/fa";
import { cn } from "@/lib/utils";

type Props = {
  examId?: Id<"exams">;
};

// ── Fallback mock cards so section is ALWAYS visible ──────────────────────
// Replace with real Convex data once you add premium cards via admin
const MOCK_PREMIUM_CARDS = [
  {
    _id: "mock-1" as Id<"premiumCards">,
    title: "JEE Physics — Mechanics Complete Pack",
    description: "Master all mechanics topics with PYQs, formula sheets, AI questions and video explanations.",
    plan: "basic" as const,
    imageUrl: undefined,
    pyqCount: 120,
    mockTestCount: 5,
    aiQuestionsCount: 200,
    videoUrl: "https://example.com",
    detailedNotes: "yes",
    formulaSheet: "yes",
    isActive: true,
  },
  {
    _id: "mock-2" as Id<"premiumCards">,
    title: "NEET Biology — Cell Biology & Genetics",
    description: "3D cell models, detailed notes, 150+ PYQs and unlimited AI-generated practice questions.",
    plan: "pro" as const,
    imageUrl: undefined,
    pyqCount: 150,
    mockTestCount: 8,
    aiQuestionsCount: 300,
    videoUrl: "https://example.com",
    detailedNotes: "yes",
    formulaSheet: "yes",
    isActive: true,
  },
  {
    _id: "mock-3" as Id<"premiumCards">,
    title: "JEE Chemistry — Organic Chemistry Elite",
    description: "3D molecular models, reaction mechanisms, 200+ PYQs, mock tests and personal AI tutor.",
    plan: "elite" as const,
    imageUrl: undefined,
    pyqCount: 200,
    mockTestCount: 12,
    aiQuestionsCount: 500,
    videoUrl: "https://example.com",
    detailedNotes: "yes",
    formulaSheet: "yes",
    isActive: true,
  },
];

const planConfig = {
  basic:  { label: "Basic",  gradient: "from-zinc-400 to-zinc-300",    glow: "shadow-zinc-400/10",   border: "border-zinc-600/30 hover:border-zinc-400/50"   },
  pro:    { label: "Pro",    gradient: "from-yellow-400 to-amber-300",  glow: "shadow-yellow-400/15", border: "border-yellow-600/30 hover:border-yellow-400/50" },
  elite:  { label: "Elite",  gradient: "from-yellow-300 to-orange-400", glow: "shadow-orange-400/15", border: "border-orange-600/30 hover:border-orange-400/50" },
};

const planAccess = {
  basic:  ["basic", "pro", "elite"],
  pro:    ["pro", "elite"],
  elite:  ["elite"],
};

export const PremiumCardsSection = ({ examId }: Props) => {
  const { user } = useUser();
  const router = useRouter();

  const dbUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const subscription = useQuery(
    api.subscriptions.getUserSubscription,
    dbUser ? { userId: dbUser._id } : "skip"
  );

  // Try real cards first, fall back to mock
  const realCards = useQuery(api.subscriptions.getPremiumCards, {
    examId,
    limit: 3,
  });

  const cards = (realCards && realCards.length > 0) ? realCards : MOCK_PREMIUM_CARDS;

  const userPlan = subscription?.status === "active" ? subscription.plan : null;

  const hasAccess = (cardPlan: "basic" | "pro" | "elite") => {
    if (!userPlan) return false;
    return planAccess[cardPlan]?.includes(userPlan) ?? false;
  };

  const handleCardClick = (card: typeof cards[0]) => {
    const accessible = hasAccess(card.plan);
    if (!user) {
      router.push("/sign-in");
      return;
    }
    if (!accessible) {
      router.push(`/subscription?highlight=${card.plan}`);
      return;
    }
    // Access granted — navigate to premium content
    router.push(`/premium/${card._id}`);
  };

  return (
    <div className="mt-12 w-full space-y-5">
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
        Unlock expert content — go beyond free quizzes and score higher
      </p>

      {/* Cards — always visible, locked or unlocked */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const accessible = hasAccess(card.plan);
          const config = planConfig[card.plan];

          return (
            <div
              key={card._id}
              onClick={() => handleCardClick(card)}
              className={cn(
                "relative group cursor-pointer rounded-2xl overflow-hidden",
                "bg-linear-to-br from-zinc-900 to-zinc-950",
                "border transition-all duration-300 hover:-translate-y-1",
                `shadow-lg ${config.glow} hover:shadow-xl`,
                config.border
              )}
            >
              {/* Golden shimmer top border */}
              <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-yellow-400/60 to-transparent" />

              {/* Plan badge — top right */}
              <div className="absolute top-3 right-3 z-10">
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-black shadow-md",
                  `bg-linear-to-r ${config.gradient}`
                )}>
                  <RiVipCrownFill className="size-3" />
                  {config.label}
                </div>
              </div>

              {/* Access indicator — top left */}
              {accessible && (
                <div className="absolute top-3 left-3 z-10">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-500 text-white">
                    ✓ Unlocked
                  </div>
                </div>
              )}

              {/* Card image / placeholder */}
              <div className="relative h-70 overflow-hidden">
                {card.imageUrl ? (
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-yellow-900/30 to-zinc-900 flex items-center justify-center">
                    <HiSparkles className="size-12 text-yellow-400/30" />
                  </div>
                )}

                {/* Lock overlay — only for non-subscribers */}
                {!accessible && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-1">
                      <FaLock className="size-5 text-yellow-400" />
                      <span className="text-yellow-400 text-xs font-semibold">
                        {!user ? "Sign in to access" : `Requires ${config.label} plan`}
                      </span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};