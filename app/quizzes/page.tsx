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

const CARDS_PER_PAGE = 12;

// ─── Seeded Fisher-Yates shuffle ──────────────────────────────────────────────
// Same seed → same order every time (stable while navigating pages).
// New seed on each full page refresh → cards reposition.
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

// ─── Main Page ────────────────────────────────────────────────────────────────
const Quizzespage = () => {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page") ?? "1");

  // Seed is captured once per mount — stable across page navigation,
  // but brand new on every browser refresh.
  const shuffleSeed = useMemo(() => Date.now(), []);

  // ── Convex queries ──
  const dbUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");
  const profile = useQuery(api.userProfiles.getProfileByUserId, dbUser ? { userId: dbUser._id } : "skip");
  const allExams = useQuery(api.admin.getAllExams);

  // Match student's target exam from their profile
  const targetExam = allExams?.find((e: { _id: Id<"exams">; name: string }) =>
    profile?.targetExam
      ? e.name.toLowerCase().includes(profile.targetExam.toLowerCase())
      : false
  );

  // Fetch all topics for matched exam
  const examTopics = useQuery(
    api.admin.getTopicsByExam,
    targetExam ? { examId: targetExam._id } : "skip"
  );

  // Fallback: show first exam's topics if student hasn't set a target exam yet
  const fallbackTopics = useQuery(
    api.admin.getTopicsByExam,
    !profile?.targetExam && allExams && allExams.length > 0
      ? { examId: allExams[0]._id }
      : "skip"
  );

  const allTopics: {
    _id: Id<"topics">;
    name: string;
    description?: string;
    imageUrl?: string;
    viewCount?: number;
  }[] = (examTopics ?? fallbackTopics ?? []) as never;

  // ── Shuffle once on mount, stable while navigating pages ──
  const shuffled = useMemo(
    () => allTopics.length > 0 ? seededShuffle(allTopics, shuffleSeed) : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allTopics.length, shuffleSeed]   // re-shuffle only when topic list size changes
  );

  // ── Slice for current page — zero repeats guaranteed ──
  const totalPages = Math.max(1, Math.ceil(shuffled.length / CARDS_PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const pageCards = shuffled.slice(
    (safePage - 1) * CARDS_PER_PAGE,
    safePage * CARDS_PER_PAGE
  );

  const isLoading = allExams === undefined || (targetExam && examTopics === undefined);

  return (
    <div>
      <Navbar />
      <div className="w-full h-full flex flex-col items-center justify-center relative top-30">
        <Topbar />

        {/* Subtle context label */}
        {targetExam && !isLoading && (
          <p className="text-zinc-500 text-sm mb-4 w-full">
            Showing topics for{" "}
            <span className="text-[#FF8D28] font-medium">{targetExam.name}</span>
            {" "}— your target exam
            <span className="text-zinc-600 ml-2">
              ({shuffled.length} topics · page {safePage} of {totalPages})
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
              <div key={card._id} className="hover:bg-zinc-900 p-2 rounded-xl">
                <Link href={`/quiz/${card._id}`}>
                  <Card className="bg-zinc-900 border-zinc-800 hover:border-[#FF8D28] h-70 transition duration-200">
                    <CardContent className="space-y-3">
                      {card.imageUrl ? (
                        <div className="relative w-full h-48 overflow-hidden rounded-lg">
                          <Image
                            src={card.imageUrl}
                            alt={card.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 rounded-lg bg-linear-to-br from-orange-900/30 to-zinc-800 flex items-center justify-center">
                          <span className="text-zinc-600 text-4xl">📚</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>

                <div className="flex flex-col items-center justify-center py-2">
                  <div className="flex flex-row items-center justify-between space-x-85">
                    <Link href={`/quiz/${card._id}`} className="w-full">
                      <h2 className="text-sm text-muted-foreground hover:text-white">
                        {card.name}
                      </h2>
                    </Link>
                    <div className="flex flex-row items-center text-sm text-muted-foreground hover:text-white">
                      <FaEye />&nbsp;{card.viewCount ?? 0}
                    </div>
                  </div>

                  <div className="flex items-start w-full gap-x-4 mt-2">
                    <div className="flex-1 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {card.description ?? `Practice ${card.name} with AI-generated MCQs.`}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0 hover:bg-zinc-700">
                          <BsThreeDotsVertical className="size-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem>
                            <CgPlayListAdd className="h-5 w-5 mr-2" />
                            Add to your list
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MdPlaylistRemove className="h-5 w-5 mr-2" />
                            Remove from your list
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real total pages based on actual topic count */}
      <QuizPagination />
      <Footer />
    </div>
  );
};

export default Quizzespage;