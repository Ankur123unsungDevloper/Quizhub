"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { RiVipCrownFill } from "react-icons/ri";
import { HiSparkles } from "react-icons/hi";
import { FaEye, FaLock } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CgPlayListAdd } from "react-icons/cg";
import { MdPlaylistRemove } from "react-icons/md";
import Image from "next/image";

type Props = {
  examId?: Id<"exams">;
};

// ── Mock cards per page — each page gets different ones via rotation ──────────
const ALL_MOCK_CARDS = [
  {
    _id: "mock-1" as Id<"premiumCards">,
    title: "JEE Physics — Mechanics Complete Pack",
    description: "Master all mechanics topics with PYQs, formula sheets, AI questions and video explanations by top educators.",
    plan: "basic" as const,
    imageUrl: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=300&fit=crop",
    viewCount: 2847,
  },
  {
    _id: "mock-2" as Id<"premiumCards">,
    title: "NEET Biology — Cell Biology & Genetics",
    description: "3D cell models, detailed notes, 150+ PYQs and unlimited AI-generated practice questions.",
    plan: "pro" as const,
    imageUrl: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&h=300&fit=crop",
    viewCount: 3412,
  },
  {
    _id: "mock-3" as Id<"premiumCards">,
    title: "JEE Chemistry — Organic Reactions Elite",
    description: "3D molecular models, reaction mechanisms, 200+ PYQs, mock tests and personal AI tutor.",
    plan: "elite" as const,
    imageUrl: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=400&h=300&fit=crop",
    viewCount: 1923,
  },
  {
    _id: "mock-4" as Id<"premiumCards">,
    title: "UPSC — Polity & Constitution Mastery",
    description: "Comprehensive notes, previous year mains questions, mind maps and daily MCQ practice.",
    plan: "basic" as const,
    imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop",
    viewCount: 4201,
  },
  {
    _id: "mock-5" as Id<"premiumCards">,
    title: "JEE Maths — Calculus Deep Dive",
    description: "350+ solved problems, concept videos, formula sheets and adaptive AI practice for JEE Advanced.",
    plan: "pro" as const,
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop",
    viewCount: 2156,
  },
  {
    _id: "mock-6" as Id<"premiumCards">,
    title: "NEET Chemistry — Inorganic Reactions",
    description: "Complete reaction tables, NCERT deep analysis, 180+ PYQs with video explanations.",
    plan: "elite" as const,
    imageUrl: "https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=400&h=300&fit=crop",
    viewCount: 1678,
  },
  {
    _id: "mock-7" as Id<"premiumCards">,
    title: "Class 12 Physics — Electrostatics",
    description: "Board exam focused notes, all important derivations, numericals and previous year solutions.",
    plan: "basic" as const,
    imageUrl: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&h=300&fit=crop",
    viewCount: 3890,
  },
  {
    _id: "mock-8" as Id<"premiumCards">,
    title: "CAT — Quantitative Aptitude Elite",
    description: "500+ questions, shortcut techniques, AI-powered weak area detection and mock CATs.",
    plan: "elite" as const,
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    viewCount: 2034,
  },
  {
    _id: "mock-9" as Id<"premiumCards">,
    title: "GATE CS — Data Structures & Algorithms",
    description: "Previous 15 years GATE questions, complexity analysis, implementation practice.",
    plan: "pro" as const,
    imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=300&fit=crop",
    viewCount: 1456,
  },
];

const planConfig = {
  basic: {
    gradient: "from-zinc-400 to-zinc-300",
    label: "Basic",
    badgeBg: "bg-gradient-to-r from-zinc-400 to-zinc-300",
  },
  pro: {
    gradient: "from-yellow-400 to-amber-300",
    label: "Pro",
    badgeBg: "bg-gradient-to-r from-yellow-400 to-amber-300",
  },
  elite: {
    gradient: "from-yellow-300 to-orange-400",
    label: "Elite",
    badgeBg: "bg-gradient-to-r from-yellow-300 to-orange-400",
  },
};

// Access map: which plans can access which card tier
const planAccess: Record<string, string[]> = {
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

  // Try real Convex cards first, fall back to rotating mock cards
  const realCards = useQuery(api.subscriptions.getPremiumCards, {
    examId,
    limit: 3,
  });

  // Rotate mock cards based on examId hash so each page shows different ones
  const getMockCards = () => {
    const hash = examId
      ? examId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
      : 0;
    const offset = hash % (ALL_MOCK_CARDS.length - 3);
    return ALL_MOCK_CARDS.slice(offset, offset + 3);
  };

  const cards = (realCards && realCards.length > 0) ? realCards.map(c => ({
    _id: c._id,
    title: c.title,
    description: c.description,
    plan: c.plan,
    imageUrl: c.imageUrl,
    viewCount: 0,
  })) : getMockCards();

  const userPlan = subscription?.status === "active" ? subscription.plan : null;

  const hasAccess = (cardPlan: "basic" | "pro" | "elite") => {
    if (!userPlan) return false;
    return planAccess[cardPlan]?.includes(userPlan) ?? false;
  };

  const handleCardClick = (cardPlan: "basic" | "pro" | "elite", cardId: Id<"premiumCards">) => {
    if (!user) { router.push("/sign-in"); return; }
    if (!hasAccess(cardPlan)) {
      router.push(`/subscription?highlight=${cardPlan}`);
      return;
    }
    router.push(`/premium/${cardId}`);
  };

  return (
    <div className="mt-12 w-full space-y-5">
      {/* Section divider — same style as rest of page */}
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

      {/* Cards grid — exact same layout as QuizCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {cards.map((card) => {
          const accessible = hasAccess(card.plan);
          const config = planConfig[card.plan];

          return (
            <div
              key={card._id}
              onClick={() => handleCardClick(card.plan, card._id as Id<"premiumCards">)}
              className="block hover:bg-zinc-900 p-2 rounded-xl transition duration-200 cursor-pointer"
            >
              {/* Exact same Card structure as QuizCard */}
              <Card className="bg-zinc-900 border-zinc-800 hover:border-[#FF8D28] -py-6 overflow-hidden transition duration-200">
                <CardContent className="p-0">
                  <div className="relative w-full h-60 overflow-hidden">

                    {card.imageUrl ? (
                      <>
                        <Image
                          src={card.imageUrl}
                          alt={card.title}
                          fill
                          className={`object-cover w-full h-full transition-transform duration-300 group-hover:scale-105 ${
                            !accessible ? "brightness-50" : ""
                          }`}
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-zinc-900/60 to-transparent" />
                      </>
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-yellow-900/40 to-zinc-900 flex flex-col items-center justify-center gap-2">
                        <HiSparkles className="size-10 text-yellow-400/30" />
                        <p className="text-white/30 text-sm font-medium uppercase tracking-widest">Premium</p>
                      </div>
                    )}

                    {/* ── Golden crown badge — top right (the only difference from normal cards) ── */}
                    <div className="absolute top-3 right-3 z-10">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-black shadow-lg ${config.badgeBg}`}>
                        <RiVipCrownFill className="size-3" />
                        {config.label}
                      </div>
                    </div>

                    {/* Lock overlay for non-subscribers */}
                    {!accessible && (
                      <div className="absolute inset-0 flex items-end justify-center pb-4">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm">
                          <FaLock className="size-3 text-yellow-400" />
                          <span className="text-yellow-400 text-xs font-semibold">
                            {!user ? "Sign in" : `${config.label} plan required`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Card info — exact same as QuizCard */}
              <div className="flex flex-col py-2 px-1">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs px-2 py-1 rounded-full capitalize text-zinc-500 hover:text-white">
                    {card.title}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-zinc-500">
                    <FaEye className="size-3" />
                    <span>{card.viewCount ?? 0}</span>
                  </div>
                </div>

                <div className="flex items-start gap-x-2 mt-4">
                  <p className="flex-1 text-xs text-zinc-500 leading-relaxed line-clamp-2">
                    {card.description}
                  </p>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 hover:bg-zinc-700 h-7 w-7"
                      >
                        <BsThreeDotsVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <CgPlayListAdd className="h-5 w-5 mr-2" />
                          Add to your list
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <MdPlaylistRemove className="h-5 w-5 mr-2" />
                          Remove from your list
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};