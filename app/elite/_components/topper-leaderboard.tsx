/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { RiVipCrownFill } from "react-icons/ri";
import { FaTrophy, FaMedal } from "react-icons/fa";
import { SlUser } from "react-icons/sl";

type Props = {
  userId: Id<"users">;
  examId?: Id<"exams">;
};

// Mock leaderboard data — replace with real Convex query when you have attempt data
const MOCK_LEADERS = [
  { name: "Arjun S.",      accuracy: 94, attempts: 312, avatar: null, isTopper: true  },
  { name: "Priya M.",      accuracy: 91, attempts: 287, avatar: null, isTopper: true  },
  { name: "Rohit K.",      accuracy: 89, attempts: 256, avatar: null, isTopper: true  },
  { name: "Sneha P.",      accuracy: 87, attempts: 234, avatar: null, isTopper: false },
  { name: "Varun T.",      accuracy: 85, attempts: 198, avatar: null, isTopper: false },
  { name: "Ananya R.",     accuracy: 83, attempts: 176, avatar: null, isTopper: false },
  { name: "Karthik N.",    accuracy: 80, attempts: 154, avatar: null, isTopper: false },
];

const rankColors = [
  "text-yellow-400",  // 1st
  "text-zinc-300",    // 2nd
  "text-amber-600",   // 3rd
];

const rankIcons = [
  <FaTrophy key="1" className="size-4 text-yellow-400" />,
  <FaMedal  key="2" className="size-4 text-zinc-300" />,
  <FaMedal  key="3" className="size-4 text-amber-600" />,
];

export const TopperLeaderboard = ({ userId }: Props) => {
  // Get current user's data
  const dbUser = useQuery(api.users.getUserByClerkId, "skip" as never);

  // Mock current user rank (replace with real data)
  const myRank = 12;
  const myAccuracy = 71;
  const myAttempts = 89;

  return (
    <div className="bg-zinc-950 border border-yellow-500/20 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <FaTrophy className="size-4 text-yellow-400" />
          <span className="text-white font-semibold text-sm">Topper Leaderboard</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 font-bold">ELITE</span>
        </div>
        <span className="text-zinc-500 text-xs">This Month</span>
      </div>

      <div className="p-4 space-y-3">
        {/* Top 3 podium */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {MOCK_LEADERS.slice(0, 3).map((leader, i) => (
            <div
              key={leader.name}
              className={`flex flex-col items-center p-3 rounded-xl border text-center ${
                i === 0
                  ? "bg-yellow-900/20 border-yellow-600/30 order-first"
                  : i === 1
                  ? "bg-zinc-800/50 border-zinc-700/50"
                  : "bg-amber-900/20 border-amber-800/30"
              }`}
              style={{ order: i === 1 ? -1 : i === 0 ? 0 : 1 }}
            >
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                  i === 0 ? "bg-yellow-900/50" : "bg-zinc-700"
                }`}>
                  <SlUser className="size-5 text-zinc-300" />
                </div>
                <div className="absolute -top-1 -right-1">
                  {rankIcons[i]}
                </div>
              </div>
              <p className={`text-xs font-bold mt-1 ${rankColors[i]}`}>{i + 1 === 1 ? "🥇" : i + 1 === 2 ? "🥈" : "🥉"}</p>
              <p className="text-white text-xs font-semibold truncate w-full">{leader.name}</p>
              <p className="text-green-400 text-sm font-black">{leader.accuracy}%</p>
              <p className="text-zinc-500 text-[10px]">{leader.attempts} attempts</p>
            </div>
          ))}
        </div>

        {/* Full list */}
        <div className="space-y-1.5">
          {MOCK_LEADERS.map((leader, i) => (
            <div key={leader.name}
              className="flex items-center gap-3 py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800">
              <span className={`text-sm font-bold w-6 text-center ${rankColors[i] ?? "text-zinc-500"}`}>
                {i + 1}
              </span>
              <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                <SlUser className="size-3.5 text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{leader.name}</p>
                <p className="text-zinc-500 text-xs">{leader.attempts} attempts</p>
              </div>
              {leader.isTopper && (
                <RiVipCrownFill className="size-3.5 text-yellow-400 shrink-0" />
              )}
              <span className="text-green-400 text-sm font-bold shrink-0">{leader.accuracy}%</span>
            </div>
          ))}
        </div>

        {/* My rank separator */}
        <div className="border-t border-dashed border-zinc-700 pt-3">
          <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-[#FF8D28]/10 border border-[#FF8D28]/30">
            <span className="text-[#FF8D28] text-sm font-bold w-6 text-center">#{myRank}</span>
            <div className="w-7 h-7 rounded-full bg-[#FF8D28]/20 flex items-center justify-center shrink-0">
              <SlUser className="size-3.5 text-[#FF8D28]" />
            </div>
            <div className="flex-1">
              <p className="text-[#FF8D28] text-sm font-medium">You</p>
              <p className="text-zinc-500 text-xs">{myAttempts} attempts</p>
            </div>
            <span className="text-[#FF8D28] text-sm font-bold">{myAccuracy}%</span>
          </div>
          <p className="text-center text-zinc-600 text-xs mt-2">
            +{MOCK_LEADERS[0].accuracy - myAccuracy}% to reach rank #1
          </p>
        </div>
      </div>
    </div>
  );
};