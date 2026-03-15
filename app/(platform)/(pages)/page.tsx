"use client";

import { Suspense } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { QuizCard, QuizCardSkeletonGrid } from "./_components/quiz-card";
import Topbar from "./_components/topbar";
import { QuizPagination } from "@/components/quiz-pagination";

type CardType = {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  viewCount?: number;
  cardType: "exam" | "subject" | "topic";
  category?: string;
  difficultyWeight?: number;
  parentName?: string;
  examName?: string;
};

const MainPageContent = () => {
  const cards = useQuery(api.cards.getRandomCards, { limit: 20 });

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="w-full h-full flex flex-col items-center justify-center relative top-20">
        <Topbar />

        {cards === undefined ? (
          <QuizCardSkeletonGrid />
        ) : cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-zinc-400 text-lg">No content yet.</p>
            <p className="text-zinc-500 text-sm">
              Add exams, subjects and topics to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {cards.map((card) => (
              <QuizCard key={card._id} card={{ ...card, cardType: "topic" } as CardType} />
            ))}
          </div>
        )}
      </div>

      <QuizPagination />
    </div>
  );
};

export default function MainPage() {
  return (
    <Suspense fallback={null}>
      <MainPageContent />
    </Suspense>
  );
}