/* eslint-disable react-hooks/purity */
"use client";

import React from "react";

import Link from "next/link";

import { useUser } from "@clerk/nextjs";

import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

import Navbar from "@/app/(platform)/navbar/navbar";
import Footer from "@/app/(platform)/footer/footer";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

import {
  FaTrophy,
  FaMedal,
  FaFire,
  FaUsers,
  FaComments,
  FaCalendarAlt,
  FaStar,
} from "react-icons/fa";
import {
  MdLeaderboard,
  MdGroup, 
  MdForum,
  MdEvent
} from "react-icons/md";
import { HiLightningBolt } from "react-icons/hi";



// ─── Static placeholder data (replaced with real Convex queries later) ───────
const MOCK_LEADERS = [
  { rank: 1, name: "Priya Sharma", exam: "JEE Advanced", quizzes: 284, accuracy: 91, streak: 42 },
  { rank: 2, name: "Arjun Mehta", exam: "NEET", quizzes: 261, accuracy: 88, streak: 38 },
  { rank: 3, name: "Sneha Patel", exam: "UPSC CSE", quizzes: 247, accuracy: 85, streak: 31 },
  { rank: 4, name: "Rahul Gupta", exam: "JEE Main", quizzes: 230, accuracy: 83, streak: 27 },
  { rank: 5, name: "Ananya Singh", exam: "NEET", quizzes: 218, accuracy: 82, streak: 24 },
  { rank: 6, name: "Dev Kumar", exam: "CAT", quizzes: 205, accuracy: 80, streak: 21 },
  { rank: 7, name: "Riya Joshi", exam: "JEE Advanced", quizzes: 198, accuracy: 79, streak: 19 },
  { rank: 8, name: "Karan Verma", exam: "GATE", quizzes: 185, accuracy: 77, streak: 16 },
  { rank: 9, name: "Pooja Agarwal", exam: "UPSC CSE", quizzes: 172, accuracy: 76, streak: 14 },
  { rank: 10, name: "Amit Yadav", exam: "JEE Main", quizzes: 160, accuracy: 74, streak: 12 },
];

const MOCK_DISCUSSIONS = [
  {
    id: "1",
    title: "Best strategy for JEE Physics - Mechanics?",
    author: "Arjun Mehta",
    exam: "JEE Advanced",
    replies: 24,
    upvotes: 87,
    time: "2h ago",
    tag: "Strategy",
  },
  {
    id: "2",
    title: "NEET Biology: How to remember all the diagrams?",
    author: "Sneha Patel",
    exam: "NEET",
    replies: 31,
    upvotes: 62,
    time: "4h ago",
    tag: "Tips",
  },
  {
    id: "3",
    title: "Daily quiz streak — who else is on 30+ days?",
    author: "Priya Sharma",
    exam: "JEE Advanced",
    replies: 58,
    upvotes: 145,
    time: "6h ago",
    tag: "Motivation",
  },
  {
    id: "4",
    title: "UPSC Prelims — how many mock tests before the real one?",
    author: "Dev Kumar",
    exam: "UPSC CSE",
    replies: 19,
    upvotes: 43,
    time: "1d ago",
    tag: "Strategy",
  },
  {
    id: "5",
    title: "Which topics carry the most weight in GATE CS?",
    author: "Karan Verma",
    exam: "GATE",
    replies: 14,
    upvotes: 38,
    time: "1d ago",
    tag: "Tips",
  },
];

const MOCK_EVENTS = [
  {
    id: "1",
    title: "Weekly JEE Speed Quiz",
    desc: "50 questions, 30 minutes. Top 3 get a special badge.",
    date: "Every Sunday, 7 PM IST",
    participants: 312,
    type: "Quiz Battle",
    active: true,
  },
  {
    id: "2",
    title: "NEET Biology Blitz",
    desc: "Focus on Genetics & Evolution. 25 questions, timed.",
    date: "Mar 16, 2026 — 6 PM IST",
    participants: 198,
    type: "Challenge",
    active: true,
  },
  {
    id: "3",
    title: "UPSC Current Affairs Marathon",
    desc: "100 questions covering last 3 months of current affairs.",
    date: "Mar 20, 2026 — 5 PM IST",
    participants: 143,
    type: "Marathon",
    active: false,
  },
  {
    id: "4",
    title: "All-India Mock — JEE Main",
    desc: "Full 3-hour mock with real exam pattern. Rank among all participants.",
    date: "Mar 23, 2026 — 9 AM IST",
    participants: 521,
    type: "Mock Test",
    active: false,
  },
];

// ─── Sub components ───────────────────────────────────────────────────────────

const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) return <FaTrophy className="size-5 text-yellow-400" />;
  if (rank === 2) return <FaMedal className="size-5 text-zinc-300" />;
  if (rank === 3) return <FaMedal className="size-5 text-amber-600" />;
  return <span className="text-zinc-500 text-sm font-bold w-5 text-center">#{rank}</span>;
};

const TagPill = ({ tag }: { tag: string }) => {
  const colors: Record<string, string> = {
    Strategy: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Tips: "bg-green-500/10 text-green-400 border-green-500/20",
    Motivation: "bg-[#FF8D28]/10 text-[#FF8D28] border-[#FF8D28]/20",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${colors[tag] ?? "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
      {tag}
    </span>
  );
};

const EventTypePill = ({ type }: { type: string }) => (
  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF8D28]/10 border border-[#FF8D28]/20 text-[#FF8D28] font-medium">
    {type}
  </span>
);

// ─── Tab content ─────────────────────────────────────────────────────────────

const LeaderboardTab = () => {
  const [period, setPeriod] = React.useState<"weekly" | "alltime">("weekly");

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
      <div className="grid grid-cols-3 gap-3 mb-2">
        {[MOCK_LEADERS[1], MOCK_LEADERS[0], MOCK_LEADERS[2]].map((l, i) => (
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

      {/* Rest of leaderboard */}
      <div className="flex flex-col gap-2">
        {MOCK_LEADERS.slice(3).map((l) => (
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
              <p className="text-zinc-500 text-xs truncate">{l.exam}</p>
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

const GroupsTab = ({ exams }: { exams: { _id: string; name: string }[] | undefined }) => {
  const groups = exams?.map((e, i) => ({
    id: e._id,
    name: `${e.name} Aspirants`,
    exam: e.name,
    members: [312, 248, 195, 143, 98, 67][i] ?? Math.floor(Math.random() * 200) + 50,
    active: Math.floor(Math.random() * 30) + 5,
    topics: ["Strategy", "Doubts", "Resources", "Mock Tests"],
  })) ?? [
    { id: "1", name: "JEE Advanced Aspirants", exam: "JEE Advanced", members: 312, active: 28, topics: ["Strategy", "Doubts"] },
    { id: "2", name: "NEET Aspirants", exam: "NEET", members: 248, active: 21, topics: ["Biology", "Chemistry"] },
    { id: "3", name: "UPSC CSE Aspirants", exam: "UPSC CSE", members: 195, active: 17, topics: ["Current Affairs", "History"] },
    { id: "4", name: "CAT Aspirants", exam: "CAT", members: 143, active: 12, topics: ["Quant", "VARC"] },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {groups.map((g) => (
        <div
          key={g.id}
          className="flex flex-col gap-3 p-5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-[#FF8D28]/40 transition cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div className="size-10 rounded-xl bg-[#FF8D28]/10 border border-[#FF8D28]/20 flex items-center justify-center">
              <FaUsers className="size-4 text-[#FF8D28]" />
            </div>
            <span className="text-[10px] px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-medium">
              {g.active} online
            </span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm group-hover:text-[#FF8D28] transition">{g.name}</p>
            <p className="text-zinc-500 text-xs mt-0.5">{g.members} members</p>
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

      {/* Create group CTA */}
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

const DiscussionsTab = () => (
  <div className="flex flex-col gap-3">
    {/* Coming soon notice */}
    <div className="flex items-center gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl mb-2">
      <MdForum className="size-5 text-blue-400 shrink-0" />
      <p className="text-blue-300 text-xs">
        Full discussion posting is coming soon. For now, browse popular threads from our community.
      </p>
    </div>

    {MOCK_DISCUSSIONS.map((d) => (
      <div
        key={d.id}
        className="flex gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition cursor-pointer group"
      >
        {/* Upvote */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <button className="text-zinc-600 hover:text-[#FF8D28] transition">
            <FaStar className="size-4" />
          </button>
          <span className="text-zinc-400 text-xs font-bold">{d.upvotes}</span>
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <TagPill tag={d.tag} />
            <span className="text-zinc-600 text-[10px]">{d.exam}</span>
          </div>
          <p className="text-white text-sm font-medium group-hover:text-[#FF8D28] transition line-clamp-2">
            {d.title}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-zinc-600 text-xs">by {d.author}</span>
            <span className="text-zinc-700 text-xs">·</span>
            <span className="text-zinc-600 text-xs flex items-center gap-1">
              <FaComments className="size-3" /> {d.replies} replies
            </span>
            <span className="text-zinc-700 text-xs">·</span>
            <span className="text-zinc-600 text-xs">{d.time}</span>
          </div>
        </div>
      </div>
    ))}

    <button className="w-full py-3 border border-zinc-800 rounded-xl text-zinc-500 text-sm hover:border-zinc-600 hover:text-zinc-300 transition">
      Load more discussions
    </button>
  </div>
);

const EventsTab = () => (
  <div className="flex flex-col gap-4">
    {/* Banner */}
    <div className="p-5 bg-linear-to-r from-[#FF8D28]/10 to-transparent border border-[#FF8D28]/20 rounded-2xl flex items-center gap-4">
      <HiLightningBolt className="size-8 text-[#FF8D28] shrink-0" />
      <div>
        <p className="text-white font-bold">Weekly Quiz Battle is LIVE!</p>
        <p className="text-zinc-400 text-xs mt-0.5">312 students participating right now. Join before it ends.</p>
      </div>
      <button className="ml-auto shrink-0 px-4 py-2 bg-[#FF8D28] hover:bg-[#FF8D28]/90 text-white text-xs font-semibold rounded-lg transition">
        Join Now
      </button>
    </div>

    {MOCK_EVENTS.map((e) => (
      <div
        key={e.id}
        className={`flex gap-4 p-5 rounded-2xl border transition ${
          e.active
            ? "bg-zinc-900 border-zinc-700"
            : "bg-zinc-900/50 border-zinc-800"
        }`}
      >
        <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
          e.active ? "bg-[#FF8D28]/10" : "bg-zinc-800"
        }`}>
          <FaCalendarAlt className={`size-4 ${e.active ? "text-[#FF8D28]" : "text-zinc-600"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <EventTypePill type={e.type} />
            {e.active && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-medium">
                Upcoming
              </span>
            )}
          </div>
          <p className="text-white font-semibold text-sm">{e.title}</p>
          <p className="text-zinc-500 text-xs mt-1">{e.desc}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-zinc-500 text-xs flex items-center gap-1">
              <FaCalendarAlt className="size-3" /> {e.date}
            </span>
            <span className="text-zinc-700 text-xs">·</span>
            <span className="text-zinc-500 text-xs flex items-center gap-1">
              <FaUsers className="size-3" /> {e.participants} registered
            </span>
          </div>
        </div>
        <button className={`shrink-0 self-center px-4 py-2 text-xs font-semibold rounded-lg transition ${
          e.active
            ? "bg-[#FF8D28] hover:bg-[#FF8D28]/90 text-white"
            : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
        }`}>
          {e.active ? "Register" : "Remind Me"}
        </button>
      </div>
    ))}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const { user } = useUser();
  const allExams = useQuery(api.admin.getAllExams);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <Navbar />

      <main className="flex-1 w-full flex flex-col items-center pt-28 pb-16">
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

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: "Active Students", value: "2,841", icon: <FaUsers className="size-4 text-[#FF8D28]" /> },
              { label: "Quizzes Today", value: "12,490", icon: <FaFire className="size-4 text-orange-400" /> },
              { label: "Discussions", value: "384", icon: <FaComments className="size-4 text-blue-400" /> },
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

          {/* shadcn Tabs */}
          <Tabs defaultValue="leaderboard">
            <TabsList className="w-full bg-zinc-900 border border-zinc-800 p-1 h-auto rounded-xl mb-6">
              <TabsTrigger
                value="leaderboard"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg group-data-[variant=line]/tabs-list:data-[state=active]:bg-[#FF8D28] data-[state=active]:text-white text-zinc-400"
              >
                <MdLeaderboard className="size-4" /> Leaderboard
              </TabsTrigger>
              <TabsTrigger
                value="groups"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg data-[state=active]:bg-[#FF8D28] data-[state=active]:text-white text-zinc-400"
              >
                <MdGroup className="size-4" /> Study Groups
              </TabsTrigger>
              <TabsTrigger
                value="discussions"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg data-[state=active]:bg-[#FF8D28] data-[state=active]:text-white text-zinc-400"
              >
                <MdForum className="size-4" /> Discussions
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg data-[state=active]:bg-[#FF8D28] data-[state=active]:text-white text-zinc-400"
              >
                <MdEvent className="size-4" /> Events
              </TabsTrigger>
            </TabsList>

            <TabsContent value="leaderboard">
              <LeaderboardTab />
            </TabsContent>
            <TabsContent value="groups">
              <GroupsTab exams={allExams as { _id: string; name: string }[] | undefined} />
            </TabsContent>
            <TabsContent value="discussions">
              <DiscussionsTab />
            </TabsContent>
            <TabsContent value="events">
              <EventsTab />
            </TabsContent>
          </Tabs>

        </div>
      </main>

      <Footer />
    </div>
  );
}