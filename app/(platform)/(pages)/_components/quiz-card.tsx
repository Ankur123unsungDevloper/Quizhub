"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Link from "next/link";

import { useMutation } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { FaEye } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { CgPlayListAdd } from "react-icons/cg";
import { MdPlaylistRemove } from "react-icons/md";
import Image from "next/image";

type CardData = {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  viewCount?: number;
  cardType: "exam" | "subject" | "topic";
  parentName?: string;
  examName?: string;
  category?: string;
  difficultyWeight?: number;
};

// ─── Fallback gradient based on card type ────────────────────────────────────
const fallbackGradients: Record<string, string> = {
  exam: "from-orange-900 to-zinc-900",
  subject: "from-blue-900 to-zinc-900",
  topic: "from-purple-900 to-zinc-900",
};

const fallbackIcons: Record<string, string> = {
  exam:    "📋",
  subject: "📚",
  topic:   "📝",
};

export const QuizCard = ({ card }: { card: CardData }) => {
  const incrementViewCount = useMutation(api.cards.incrementViewCount);

  const handleClick = () => {
    incrementViewCount({
      topicId: card._id as Id<"topics">,
    });
  };

  return (
    <Link
      href={card.cardType === "topic" ? `/quiz/${card._id}` : `/cards/${card.cardType}/${card._id}`}
      onMouseDown={handleClick}
      className="block hover:bg-zinc-900 p-2 rounded-xl transition duration-200"
    >
      {/* Image */}
      <Card className="bg-zinc-900 border-zinc-800 hover:border-[#FF8D28] -py-6 overflow-hidden transition duration-200">
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
                    // Hide broken image, show fallback
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                {/* Gradient overlay for better text readability */}
                <div className="absolute inset-0 bg-linear-to-t from-zinc-900/60 to-transparent" />
              </>
            ) : (
              // Fallback when no image
              <div
                className={`w-full h-full bg-linear-to-br ${fallbackGradients[card.cardType]} flex flex-col items-center justify-center gap-2`}
              >
                <span className="text-5xl">{fallbackIcons[card.cardType]}</span>
                <p className="text-white/30 text-sm font-medium uppercase tracking-widest">
                  {card.cardType}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card Info */}
      <div className="flex flex-col py-2 px-1">

        {/* Group label + view count */}
        <div className="flex items-center justify-between w-full">
          <span
            className={`text-xs px-2 py-1 rounded-full capitalize text-zinc-500 hover:text-white`}
          >
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
            {card.description ?? `Practice ${card.name} with AI-generated questions`}
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              onClick={(e) => e.preventDefault()} // prevent card navigation
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
                <DropdownMenuItem
                  onClick={(e) => e.preventDefault()}
                >
                  <CgPlayListAdd className="h-5 w-5 mr-2" />
                  Add to your list
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => e.preventDefault()}
                >
                  <MdPlaylistRemove className="h-5 w-5 mr-2" />
                  Remove from your list
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Link>
  );
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────
export const QuizCardSkeleton = () => (
  <div className="p-2 rounded-xl animate-pulse">
    <div className="bg-zinc-800 rounded-xl h-48 w-full" />
    <div className="flex items-center justify-between mt-3 px-1">
      <div className="bg-zinc-800 rounded-full h-5 w-20" />
      <div className="bg-zinc-800 rounded h-4 w-10" />
    </div>
    <div className="mt-2 px-1 space-y-2">
      <div className="bg-zinc-800 rounded h-4 w-40" />
      <div className="bg-zinc-800 rounded h-3 w-full" />
      <div className="bg-zinc-800 rounded h-3 w-4/5" />
    </div>
  </div>
);

export const QuizCardSkeletonGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
    {Array.from({ length: 6 }).map((_, i) => (
      <QuizCardSkeleton key={i} />
    ))}
  </div>
);