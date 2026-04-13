"use client";

import { useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { cn } from "@/lib/utils";

const filters = [
  // ── General ───────────────────────────────────────────────────────────────
  { label: "All",           value: "",            emoji: "✦" },
  { label: "Popular",       value: "popular",     emoji: "🔥" },
  { label: "New",           value: "new",         emoji: "⚡" },
  { label: "Trending",      value: "trending",    emoji: "📈" },

  // ── By category ───────────────────────────────────────────────────────────
  { label: "School",        value: "school",      emoji: "🏫" },
  { label: "College",       value: "college",     emoji: "🎓" },
  { label: "Competitive",   value: "competitive", emoji: "🏆" },

  // ── By difficulty ─────────────────────────────────────────────────────────
  { label: "Easy",          value: "easy",        emoji: "🟢" },
  { label: "Medium",        value: "medium",      emoji: "🟡" },
  { label: "Hard",          value: "hard",        emoji: "🔴" },

  // ── By subject ────────────────────────────────────────────────────────────
  { label: "Math",          value: "math",        emoji: "📐" },
  { label: "Physics",       value: "physics",     emoji: "⚛️" },
  { label: "Chemistry",     value: "chemistry",   emoji: "🧪" },
  { label: "Biology",       value: "biology",     emoji: "🧬" },
  { label: "English",       value: "english",     emoji: "📖" },
  { label: "History",       value: "history",     emoji: "🏺" },
  { label: "Geography",     value: "geography",   emoji: "🌍" },
  { label: "Reasoning",     value: "reasoning",   emoji: "🧠" },
  { label: "GK",            value: "gk",          emoji: "🌐" },
  { label: "Computer Sci",  value: "cs",          emoji: "💻" },
  { label: "Economics",     value: "economics",   emoji: "📊" },
  { label: "Science",       value: "science",     emoji: "🔬" },

  // ── By exam ───────────────────────────────────────────────────────────────
  { label: "JEE",           value: "jee",         emoji: "🏛️" },
  { label: "NEET",          value: "neet",        emoji: "🏥" },
  { label: "UPSC",          value: "upsc",        emoji: "🎖️" },
  { label: "CAT",           value: "cat",         emoji: "📋" },
  { label: "GATE",          value: "gate",        emoji: "⚙️" },
  { label: "Boards",        value: "boards",      emoji: "📝" },
];

const HomeTopbar = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeFilter = searchParams.get("filter") ?? "";

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  const handleFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "") {
      params.delete("filter");
    } else {
      params.set("filter", value);
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="relative w-full py-3">

      {/* Left fade + arrow */}
      <div className="absolute left-0 top-0 h-full flex items-center z-10 pr-3
        bg-linear-to-r from-zinc-950 via-zinc-950/80 to-transparent">
        <button
          onClick={() => scroll("left")}
          className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700
            flex items-center justify-center hover:bg-zinc-700
            hover:border-[#FF8D28]/50 transition-all duration-200 group"
        >
          <FaChevronLeft className="text-zinc-400 group-hover:text-[#FF8D28] size-3 transition-colors" />
        </button>
      </div>

      {/* Scrollable pills */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide gap-2 px-12"
      >
        {filters.map((f) => {
          const isActive = activeFilter === f.value;
          return (
            <button
              key={f.value || "all"}
              onClick={() => handleFilter(f.value)}
              className={cn(
                "shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full",
                "text-sm font-medium border transition-all duration-200 whitespace-nowrap",
                isActive
                  ? "bg-[#FF8D28] border-[#FF8D28] text-black font-semibold shadow-lg shadow-[#FF8D28]/20 scale-105"
                  : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-[#FF8D28]/40 hover:text-white hover:bg-zinc-800"
              )}
            >
              <span className="text-sm leading-none">{f.emoji}</span>
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Right fade + arrow */}
      <div className="absolute right-0 top-0 h-full flex items-center z-10 pl-3
        bg-linear-to-l from-zinc-950 via-zinc-950/80 to-transparent">
        <button
          onClick={() => scroll("right")}
          className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700
            flex items-center justify-center hover:bg-zinc-700
            hover:border-[#FF8D28]/50 transition-all duration-200 group"
        >
          <FaChevronRight className="text-zinc-400 group-hover:text-[#FF8D28] size-3 transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default HomeTopbar;