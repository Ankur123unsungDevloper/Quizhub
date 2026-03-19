/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { RiVipCrownFill } from "react-icons/ri";
import { HiSparkles, HiLockClosed } from "react-icons/hi";

import { Model3DViewer } from "./_components/model-3d-viewer";
import { AIDoubtSolver } from "./_components/ai-doubt-solver";
import { FlashcardSystem } from "./_components/flashcard-system";
import { PerformanceHeatmap } from "./_components/performance-heatmap";
import { ExamCountdown } from "./_components/exam-countdown";
import { TopperLeaderboard } from "./_components/topper-leaderboard";

const ELITE_FEATURES = [
  { id: "3d",          label: "3D Models",         emoji: "⚛️",  desc: "Interactive molecular & physics models" },
  { id: "ai",          label: "AI Doubt Solver",   emoji: "🧠",  desc: "Chat with AI tutor about any topic"     },
  { id: "flashcards",  label: "Flashcards",         emoji: "⚡",  desc: "Spaced repetition for better retention" },
  { id: "heatmap",     label: "Heatmap",            emoji: "🔥",  desc: "Visual map of your performance"        },
  { id: "countdown",   label: "Countdown",          emoji: "⏱️", desc: "Exam timer with daily targets"          },
  { id: "leaderboard", label: "Leaderboard",        emoji: "🏆",  desc: "Compare with top students"             },
];

type Tab = "3d" | "ai" | "flashcards" | "heatmap" | "countdown" | "leaderboard";

export default function EliteFeaturesPage() {
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

  const isElite = subscription?.plan === "elite" && subscription.status === "active";

  // Paywall screen
  if (!isElite) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 pt-20">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto">
            <HiLockClosed className="size-9 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Elite Features</h1>
            <p className="text-zinc-400 mt-2">
              3D models, AI tutor, flashcards, heatmaps, countdown, and leaderboard —
              all exclusive to Elite members.
            </p>
          </div>

          {/* Feature preview */}
          <div className="grid grid-cols-3 gap-3">
            {ELITE_FEATURES.map(f => (
              <div key={f.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center opacity-60">
                <div className="text-2xl mb-1">{f.emoji}</div>
                <p className="text-white text-xs font-medium">{f.label}</p>
                <p className="text-zinc-500 text-[10px] mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push("/subscription")}
              className="w-full py-4 rounded-2xl bg-linear-to-r from-yellow-400 to-orange-400 text-black font-bold text-lg hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <RiVipCrownFill className="size-5" />
              Upgrade to Elite — ₹299/month
            </button>
            <p className="text-zinc-600 text-xs">Cancel anytime · Instant activation · Secure via Razorpay</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-6 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <RiVipCrownFill className="size-5 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-semibold">Elite Member</span>
              <HiSparkles className="size-4 text-yellow-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Your Elite Toolkit</h1>
            <p className="text-zinc-400 text-sm mt-1">Everything top rankers use to score higher</p>
          </div>
        </div>

        {/* Feature grid — 2 columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Model3DViewer />
          <AIDoubtSolver topicName="Physics" subject="Physics" />
          <FlashcardSystem topicName="Physics" />
          {dbUser && <PerformanceHeatmap userId={dbUser._id} />}
          <ExamCountdown />
          {dbUser && <TopperLeaderboard userId={dbUser._id} />}
        </div>
      </div>
    </div>
  );
}