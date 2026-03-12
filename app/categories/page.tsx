"use client";

import {
  useSearchParams,
  useRouter
} from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import {
  Card,
  CardContent
} from "@/components/ui/card";

import Footer from "../(platform)/footer/footer";
import Navbar from "../(platform)/navbar/navbar";

import Topbar from "./_components/topbar";

import { useMemo } from "react";

type CardItem = {
  _id: string;
  name: string;
  imageUrl?: string;
  cardType: "exam" | "subject" | "topic";
  href: string;
};

// ─── Single Category Card ─────────────────────────────────────────────────────
const CategoryCard = ({ item }: { item: CardItem }) => (
  <Link href={item.href}>
    <Card className="bg-zinc-900 border-zinc-800 hover:border-[#FF8D28] py-0 overflow-hidden transition duration-200 group h-40 relative">
      <CardContent className="flex flex-col items-center justify-center px-0 h-full">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 50vw, 16vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-zinc-700 to-zinc-800" />
        )}
        {/* Dark overlay so text is always readable */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
        {/* Type badge */}
        <span className="absolute top-2 right-2 text-[10px] uppercase tracking-wide bg-black/50 text-zinc-400 px-1.5 py-0.5 rounded">
          {item.cardType}
        </span>
        {/* Name */}
        <p className="absolute bottom-3 left-3 right-3 text-white text-sm font-semibold line-clamp-2 leading-snug">
          {item.name}
        </p>
      </CardContent>
    </Card>
  </Link>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="h-40 rounded-xl bg-zinc-800 animate-pulse" />
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const CategoriesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q")?.toLowerCase().trim() ?? "";

  // Fetch all data
  const allExams   = useQuery(api.admin.getAllExams) as { _id: Id<"exams">; name: string; imageUrl?: string }[] | undefined;
  const allCards   = useQuery(api.cards.getRandomCards, { limit: 200 });

  const isLoading = !allExams || !allCards;

  // Build unified card list: exams + subjects + topics
  const allItems: CardItem[] = useMemo(() => {
    if (!allExams || !allCards) return [];

    const examCards: CardItem[] = allExams.map((e) => ({
      _id: e._id as string,
      name: e.name,
      imageUrl: e.imageUrl,
      cardType: "exam",
      href: "/quizzes",
    }));

    const otherCards: CardItem[] = allCards
      .filter((c: { cardType: string }) => c.cardType !== "exam")
      .map((c: { _id: string; name: string; imageUrl?: string; cardType: "exam" | "subject" | "topic" }) => ({
        _id: c._id,
        name: c.name,
        imageUrl: c.imageUrl,
        cardType: c.cardType,
        href: c.cardType === "topic" ? `/quiz/${c._id}` : "/quizzes",
      }));

    return [...examCards, ...otherCards];
  }, [allExams, allCards]);

  // Filter by search query if present
  const filtered = useMemo(() => {
    if (!urlQuery) return allItems;
    return allItems.filter((item) =>
      item.name.toLowerCase().includes(urlQuery)
    );
  }, [allItems, urlQuery]);

  const popular = filtered.slice(0, 12);
  const rest    = filtered.slice(12);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <Navbar />

      {/* Main content — sandwiched between navbar and footer, no overlap */}
      <div className="flex-1 w-full flex flex-col items-center pt-28 pb-10">
        <div className="w-full px-6">
          <Topbar />

          {/* Search context label */}
          {urlQuery && (
            <div className="mt-4 mb-2 flex items-center gap-3">
              <p className="text-zinc-400 text-sm">
                Results for{" "}
                <span className="text-[#FF8D28] font-medium">&quot;{searchParams.get("q")}&quot;</span>
              </p>
              <button
                onClick={() => router.push("/categories")}
                className="text-zinc-600 hover:text-white text-xs underline"
              >
                Clear
              </button>
            </div>
          )}

          {/* ── Most Popular (first 12) ── */}
          <div className="mt-10">
            <h2 className="text-3xl font-bold text-white mb-6">
              {urlQuery ? "Matching Categories" : "Most Popular Quiz Categories"}
            </h2>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : popular.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <span className="text-5xl">🔍</span>
                <p className="text-white font-semibold">No categories found</p>
                <p className="text-zinc-500 text-sm">Try a different search term</p>
                <button
                  onClick={() => router.push("/categories")}
                  className="text-[#FF8D28] text-sm underline mt-1"
                >
                  Browse all
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {popular.map((item) => (
                  <CategoryCard key={item._id} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* ── All Categories (rest) ── */}
          {!isLoading && rest.length > 0 && (
            <div className="mt-20">
              <h2 className="text-3xl font-bold text-white mb-6">All Categories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {rest.map((item) => (
                  <CategoryCard key={item._id} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CategoriesPage;