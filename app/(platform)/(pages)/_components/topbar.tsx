"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";

const Topbar = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    const scrollAmount = 300;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const buttons = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <div className="relative w-full py-4">

      {/* Left Arrow */}
      <div className="absolute left-0 top-0 h-full flex items-center z-10 bg-linear-to-r from-black via-black/80 to-transparent px-3">
        <button onClick={() => scroll("left")}>
          <FaChevronLeft className="text-white size-5" />
        </button>
      </div>

      {/* Scrollable Area */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide space-x-3 px-12"
      >
        {buttons.map((num) => (
          <Button asChild key={num} className="shrink-0 bg-zinc-800 text-white">
            <Link href="/quizzes">Button {num}</Link>
          </Button>
        ))}
      </div>

      {/* Right Arrow */}
      <div className="absolute right-0 top-0 h-full flex items-center z-10 bg-linear-to-l from-black via-black/80 to-transparent px-3">
        <button onClick={() => scroll("right")}>
          <FaChevronRight className="text-white size-5" />
        </button>
      </div>
    </div>
  );
};

export default Topbar;