"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Image from "next/image";
import Link from "next/link";

import Footer from "../(platform)/footer/footer";
import Navbar from "../(platform)/navbar/navbar";
import Topbar from "./_components/topbar";
import { QuizPagination } from "@/components/quiz-pagination";

import { FaEye } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { CgPlayListAdd } from "react-icons/cg";
import { MdPlaylistRemove } from "react-icons/md";

import { Suspense } from "react";

const CARDS_PER_PAGE = 12;

const fallbackGradients: Record<string, string> = {
  quiz: "from-orange-900/40 to-zinc-800",
  exam: "from-indigo-900/40 to-zinc-800",
};

const fallbackIcons: Record<string, string> = {
  quiz: "📝",
  exam: "🎯",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type RawTopic = {
  _id: Id<"topics">;
  name: string;
  description?: string;
  imageUrl?: string;
  viewCount?: number;
};

type CardEntry = {
  id: string;             // unique key: topicId + "-quiz" | "-exam"
  topicId: Id<"topics">;
  name: string;
  description: string;    // mode-specific description
  imageUrl?: string;
  viewCount?: number;
  mode: "quiz" | "exam";
  href: string;
};

// ─── Seeded Fisher-Yates shuffle ─────────────────────────────────────────────
function seededShuffle<T>(array: T[], seed: number): T[] {
  const arr = [...array];
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Build mode-aware description
function quizDescription(name: string, original?: string): string {
  if (original) return `Quick quiz: ${original}`;
  return `Solve quick MCQs on ${name} to build your understanding and test your basics.`;
}

function examDescription(name: string, original?: string): string {
  if (original) return `Exam: ${original}`;
  return `Test your ${name} knowledge under real exam conditions — timed, scored with +4/−1 marking.`;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const QuizzespageContent = () => {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page") ?? "1");

  const shuffleSeed = useMemo(() => Date.now(), []);

  // ── Convex queries ──
  const dbUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");
  const profile = useQuery(api.userProfiles.getProfileByUserId, dbUser ? { userId: dbUser._id } : "skip");
  const allExams = useQuery(api.admin.getAllExams);

  const targetExam = allExams?.find((e: { _id: Id<"exams">; name: string }) =>
    profile?.targetExam
      ? e.name.toLowerCase().includes(profile.targetExam.toLowerCase())
      : false
  );

  const examTopics = useQuery(
    api.admin.getTopicsByExam,
    targetExam ? { examId: targetExam._id } : "skip"
  );

  const fallbackTopics = useQuery(
    api.admin.getTopicsByExam,
    !profile?.targetExam && allExams && allExams.length > 0
      ? { examId: allExams[0]._id }
      : "skip"
  );

  const allTopics: RawTopic[] = (examTopics ?? fallbackTopics ?? []) as never;

  // ── Build two cards per topic, then shuffle the full list ──
  const allCards: CardEntry[] = useMemo(() => {
    if (allTopics.length === 0) return [];
    const entries: CardEntry[] = [];
    for (const t of allTopics) {
      entries.push({
        id: `${t._id}-quiz`,
        topicId: t._id,
        name: t.name,
        description: quizDescription(t.name, t.description),
        imageUrl: t.imageUrl,
        viewCount: t.viewCount,
        mode: "quiz",
        href: `/quiz/${t._id}`,
      });
      entries.push({
        id: `${t._id}-exam`,
        topicId: t._id,
        name: t.name,
        description: examDescription(t.name, t.description),
        imageUrl: t.imageUrl,
        viewCount: t.viewCount,
        mode: "exam",
        href: `/exam/${t._id}`,
      });
    }
    return seededShuffle(entries, shuffleSeed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTopics.length, shuffleSeed]);

  const totalPages = Math.max(1, Math.ceil(allCards.length / CARDS_PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const pageCards = allCards.slice(
    (safePage - 1) * CARDS_PER_PAGE,
    safePage * CARDS_PER_PAGE
  );

  const isLoading = allExams === undefined || (targetExam && examTopics === undefined);

  return (
    <div>
      <Navbar />
      <div className="w-full h-full flex flex-col items-center justify-center relative top-30">
        <Topbar />

        {/* Context label */}
        {targetExam && !isLoading && (
          <p className="text-zinc-500 text-sm mb-4 w-full">
            Showing topics for{" "}
            <span className="text-[#FF8D28] font-medium">{targetExam.name}</span>
            {" "}— your target exam
            <span className="text-zinc-600 ml-2">
              ({allTopics.length} topics · {allCards.length} cards · page {safePage} of {totalPages})
            </span>
          </p>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {[...Array(CARDS_PER_PAGE)].map((_, i) => (
              <div key={i} className="p-2 rounded-xl animate-pulse">
                <div className="bg-zinc-800 rounded-xl h-56 mb-3" />
                <div className="h-3 bg-zinc-800 rounded w-1/2 mb-2" />
                <div className="h-3 bg-zinc-800 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Cards grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {pageCards.map((card) => (
              <Link
                key={card.id}
                href={card.href}
                className="block hover:bg-zinc-900 p-2 rounded-xl transition duration-200"
              >
                {/* Image */}
                <Card className={`bg-zinc-900 border-zinc-800 -py-6 overflow-hidden transition duration-200 ${
                  card.mode === "quiz" ? "hover:border-[#FF8D28]" : "hover:border-[#FF8D28]"
                }`}>
                  <CardContent className="p-0">
                    <div className="relative w-full h-60 overflow-hidden">
                      {card.imageUrl ? (
                        <>
                          <Image
                            src={card.imageUrl}
                            alt={card.name}
                            fill
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-zinc-900/60 to-transparent" />
                        </>
                      ) : (
                        <div className={`w-full h-full bg-linear-to-br ${fallbackGradients[card.mode]} flex flex-col items-center justify-center gap-2`}>
                          <span className="text-5xl">{fallbackIcons[card.mode]}</span>
                          <p className="text-white/30 text-sm font-medium uppercase tracking-widest">
                            {card.mode}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Card Info */}
                <div className="flex flex-col py-2 px-1">
                  {/* Name + view count */}
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs px-2 py-1 rounded-full capitalize text-zinc-500 hover:text-white">
                      {card.name}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-zinc-500">
                      <FaEye className="size-3" />
                      <span>{card.viewCount ?? 0}</span>
                    </div>
                  </div>

                  {/* Description + dropdown */}
                  <div className="flex items-start gap-x-2 mt-4">
                    <p className="flex-1 text-xs text-zinc-500 leading-relaxed line-clamp-2">
                      {card.description}
                    </p>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.preventDefault()}
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
                          <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                            <CgPlayListAdd className="h-5 w-5 mr-2" />
                            Add to your list
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                            <MdPlaylistRemove className="h-5 w-5 mr-2" />
                            Remove from your list
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <QuizPagination />
      <Footer />
    </div>
  );
};

export default function Quizzespage() {
  return (
    <Suspense fallback={null}>
      <QuizzespageContent />
    </Suspense>
  );
}