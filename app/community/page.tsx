"use client";

import React from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Navbar from "@/app/(platform)/navbar/navbar";
import Footer from "@/app/(platform)/footer/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaTrophy, FaMedal, FaFire, FaUsers } from "react-icons/fa";
import { MdLeaderboard, MdGroup, MdForum, MdEvent } from "react-icons/md";

// ─── Sub components ───────────────────────────────────────────────────────────
const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) return <FaTrophy className="size-5 text-yellow-400" />;
  if (rank === 2) return <FaMedal className="size-5 text-zinc-300" />;
  if (rank === 3) return <FaMedal className="size-5 text-amber-600" />;
  return <span className="text-zinc-500 text-sm font-bold w-5 text-center">#{rank}</span>;
};

const ComingSoon = ({ icon, label, desc }: { icon: React.ReactNode; label: string; desc: string }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
    <div className="text-zinc-700">{icon}</div>
    <p className="text-white font-semibold text-lg">{label}</p>
    <p className="text-zinc-500 text-sm max-w-sm">{desc}</p>
  </div>
);

const LeaderboardTab = () => {
  const leaderboard = useQuery(api.attempts.getLeaderboard);
  const [period, setPeriod] = React.useState<"weekly" | "alltime">("weekly");

  if (!leaderboard) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-zinc-900 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <ComingSoon
        icon={<MdLeaderboard className="size-12" />}
        label="No data yet"
        desc="Take some quizzes to appear on the leaderboard!"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Period toggle */}
      <div className="flex gap-2">
        {(["weekly", "alltime"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition ${
              period === p
                ? "bg-[#FF8D28] border-[#FF8D28] text-white"
                : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500"
            }`}
          >
            {p === "weekly" ? "This Week" : "All Time"}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-2">
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((l, i) => (
            <div
              key={l.rank}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${
                i === 1
                  ? "bg-yellow-400/5 border-yellow-400/30"
                  : "bg-zinc-900 border-zinc-800"
              }`}
            >
              <div className={`size-12 rounded-full flex items-center justify-center text-lg font-bold ${
                i === 1 ? "bg-yellow-400/20 text-yellow-400" : "bg-zinc-800 text-zinc-300"
              }`}>
                {l.name[0]}
              </div>
              <RankBadge rank={l.rank} />
              <p className="text-white text-xs font-semibold text-center line-clamp-1">{l.name}</p>
              <p className="text-zinc-500 text-[10px]">{l.quizzes} quizzes</p>
              <p className={`text-xs font-bold ${i === 1 ? "text-yellow-400" : "text-zinc-300"}`}>
                {l.accuracy}% acc
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Rest of leaderboard */}
      <div className="flex flex-col gap-2">
        {leaderboard.slice(3).map((l) => (
          <div
            key={l.rank}
            className="flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition"
          >
            <RankBadge rank={l.rank} />
            <div className="size-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300 shrink-0">
              {l.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{l.name}</p>
            </div>
            <div className="flex items-center gap-1 text-orange-400 text-xs shrink-0">
              <FaFire className="size-3" /> {l.streak}d
            </div>
            <div className="text-zinc-400 text-xs shrink-0 w-16 text-right">
              {l.accuracy}% acc
            </div>
            <div className="text-zinc-500 text-xs shrink-0 w-16 text-right">
              {l.quizzes} taken
            </div>
          </div>
        ))}
      </div>

      <p className="text-zinc-600 text-xs text-center mt-2">
        Take more quizzes to climb the leaderboard 🚀
      </p>
    </div>
  );
};

const GroupsTab = () => {
  const allExams = useQuery(api.admin.getAllExams) as { _id: string; name: string }[] | undefined;

  if (!allExams) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 bg-zinc-900 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const groups = allExams.map((e, i) => ({
    id: e._id,
    name: `${e.name} Aspirants`,
    exam: e.name,
    members: [312, 248, 195, 143, 98, 67][i] ?? 50,
    topics: ["Strategy", "Doubts", "Resources", "Mock Tests"],
  }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {groups.map((g) => (
        <div
          key={g.id}
          className="flex flex-col gap-3 p-5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-[#FF8D28]/40 transition cursor-pointer group"
        >
          <div className="size-10 rounded-xl bg-[#FF8D28]/10 border border-[#FF8D28]/20 flex items-center justify-center">
            <FaUsers className="size-4 text-[#FF8D28]" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm group-hover:text-[#FF8D28] transition">{g.name}</p>
            <p className="text-zinc-500 text-xs mt-0.5">{g.exam}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {g.topics.map((t) => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">
                {t}
              </span>
            ))}
          </div>
          <button className="mt-1 w-full py-2 rounded-lg border border-[#FF8D28]/30 text-[#FF8D28] text-xs font-medium hover:bg-[#FF8D28]/10 transition">
            Join Group
          </button>
        </div>
      ))}

      <div className="sm:col-span-2 flex items-center justify-between p-5 bg-zinc-900/50 border border-dashed border-zinc-700 rounded-2xl">
        <div>
          <p className="text-white font-semibold text-sm">Don&apos;t see your exam?</p>
          <p className="text-zinc-500 text-xs mt-0.5">Study groups are auto-created as exams are added to QuizHub.</p>
        </div>
        <Link href="/profile" className="shrink-0 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium rounded-lg transition">
          Set Target Exam →
        </Link>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CommunityPage() {
  const { user } = useUser();
  const stats = useQuery(api.attempts.getCommunityStats);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <Navbar />

      <main className="flex-1 w-full flex flex-col items-center pt-40 pb-16">
        <div className="w-full px-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaUsers className="size-5 text-[#FF8D28]" />
                <span className="text-[#FF8D28] text-sm font-medium uppercase tracking-wide">Community</span>
              </div>
              <h1 className="text-4xl font-extrabold text-white">Study Together,</h1>
              <h1 className="text-4xl font-extrabold text-zinc-500">Grow Together</h1>
            </div>
            {user && (
              <div className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                <div className="size-8 rounded-full bg-[#FF8D28]/20 flex items-center justify-center text-sm font-bold text-[#FF8D28]">
                  {user.firstName?.[0] ?? "U"}
                </div>
                <div>
                  <p className="text-white text-xs font-medium">{user.firstName}</p>
                  <p className="text-zinc-500 text-[10px]">Community Member</p>
                </div>
              </div>
            )}
          </div>

          {/* Stats row — real data */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { label: "Total Students", value: stats?.totalStudents ?? "—", icon: <FaUsers className="size-4 text-[#FF8D28]" /> },
              { label: "Total Attempts", value: stats?.totalAttempts ?? "—", icon: <FaFire className="size-4 text-orange-400" /> },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
                {s.icon}
                <div>
                  <p className="text-white font-bold text-lg">{s.value}</p>
                  <p className="text-zinc-500 text-xs">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="leaderboard">
            <TabsList className="w-full bg-zinc-900 border border-zinc-800 p-1.5 h-auto rounded-xl mb-6 gap-1">
              {[
                { value: "leaderboard", icon: <MdLeaderboard className="size-4" />, label: "Leaderboard" },
                { value: "groups",      icon: <MdGroup className="size-4" />,       label: "Study Groups" },
                { value: "discussions", icon: <MdForum className="size-4" />,       label: "Discussions" },
                { value: "events",      icon: <MdEvent className="size-4" />,       label: "Events" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="custom-tab flex-1 flex items-center justify-center gap-2 py-3 text-sm rounded-lg text-zinc-400 hover:text-white transition-all focus-visible:ring-0"
                >
                  {tab.icon} {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="leaderboard">
              <LeaderboardTab />
            </TabsContent>
            <TabsContent value="groups">
              <GroupsTab />
            </TabsContent>
            <TabsContent value="discussions">
              <ComingSoon
                icon={<MdForum className="size-12" />}
                label="Discussions coming soon"
                desc="Post questions, share strategies and help fellow students. Launching very soon."
              />
            </TabsContent>
            <TabsContent value="events">
              <ComingSoon
                icon={<MdEvent className="size-12" />}
                label="Events coming soon"
                desc="Weekly quiz battles, mock tests and challenges will be announced here."
              />
            </TabsContent>
          </Tabs>

        </div>
      </main>

      <Footer />
    </div>
  );
}