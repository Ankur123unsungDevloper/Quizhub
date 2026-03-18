"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { RiVipCrownFill } from "react-icons/ri";
import { FaLock, FaBookOpen, FaFlask, FaVideo, FaClipboardList, FaBrain } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import Image from "next/image";

type PremiumCard = {
  _id: Id<"premiumCards">;
  title: string;
  description: string;
  plan: "basic" | "pro" | "elite";
  imageUrl?: string;
  pyqCount?: number;
  mockTestCount?: number;
  aiQuestionsCount?: number;
  videoUrl?: string;
  detailedNotes?: string;
  formulaSheet?: string;
};

const planColors = {
  basic:  { badge: "from-zinc-400 to-zinc-300",   glow: "shadow-zinc-400/20",  label: "Basic"  },
  pro:    { badge: "from-yellow-400 to-amber-300", glow: "shadow-yellow-400/25", label: "Pro"   },
  elite:  { badge: "from-yellow-300 to-orange-400",glow: "shadow-orange-400/30", label: "Elite" },
};

export const PremiumCard = ({ card }: { card: PremiumCard }) => {
  const router = useRouter();
  const { user } = useUser();

  const dbUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const subscribed = useQuery(
    api.subscriptions.isSubscribed,
    dbUser ? { userId: dbUser._id } : "skip"
  );

  const plan = planColors[card.plan];

  const handleClick = () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }
    if (!subscribed) {
      router.push("/subscription");
      return;
    }
    router.push(`/quiz/${card._id}?premium=true`);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative group cursor-pointer rounded-2xl overflow-hidden
        bg-gradient-to-br from-zinc-900 to-zinc-950
        border border-yellow-500/20 hover:border-yellow-400/40
        shadow-lg ${plan.glow} hover:shadow-xl
        transition-all duration-300 hover:-translate-y-1
      `}
    >
      {/* Golden shimmer top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent" />

      {/* Crown badge — top right */}
      <div className="absolute top-3 right-3 z-10">
        <div className={`
          flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold
          bg-gradient-to-r ${plan.badge} text-black shadow-md
        `}>
          <RiVipCrownFill className="size-3" />
          {plan.label}
        </div>
      </div>

      {/* Card image */}
      <div className="relative h-36 overflow-hidden">
        {card.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt={card.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-yellow-900/30 to-zinc-900 flex items-center justify-center">
            <HiSparkles className="size-12 text-yellow-400/40" />
          </div>
        )}
        {/* Overlay when locked */}
        {!subscribed && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-1">
              <FaLock className="size-6 text-yellow-400" />
              <span className="text-yellow-400 text-xs font-semibold">Premium Content</span>
            </div>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-white font-semibold text-sm leading-tight">{card.title}</h3>
          <p className="text-zinc-400 text-xs mt-1 line-clamp-2">{card.description}</p>
        </div>

        {/* What's inside */}
        <div className="grid grid-cols-2 gap-1.5">
          {card.detailedNotes && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <FaBookOpen className="size-3 text-yellow-400 shrink-0" />
              <span>Detailed Notes</span>
            </div>
          )}
          {card.formulaSheet && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <FaFlask className="size-3 text-yellow-400 shrink-0" />
              <span>Formula Sheet</span>
            </div>
          )}
          {card.pyqCount && card.pyqCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <FaClipboardList className="size-3 text-yellow-400 shrink-0" />
              <span>{card.pyqCount} PYQs</span>
            </div>
          )}
          {card.mockTestCount && card.mockTestCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <FaClipboardList className="size-3 text-yellow-400 shrink-0" />
              <span>{card.mockTestCount} Mock Tests</span>
            </div>
          )}
          {card.aiQuestionsCount && card.aiQuestionsCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <FaBrain className="size-3 text-yellow-400 shrink-0" />
              <span>{card.aiQuestionsCount} AI Questions</span>
            </div>
          )}
          {card.videoUrl && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <FaVideo className="size-3 text-yellow-400 shrink-0" />
              <span>Video Explanation</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <button className={`
          w-full py-2 rounded-xl text-xs font-bold transition-all duration-200
          ${subscribed
            ? "bg-gradient-to-r from-yellow-400 to-amber-400 text-black hover:opacity-90"
            : "bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/20"
          }
        `}>
          {!user ? "Sign in to Access" : subscribed ? "Start Learning →" : "Unlock with Pro →"}
        </button>
      </div>
    </div>
  );
};