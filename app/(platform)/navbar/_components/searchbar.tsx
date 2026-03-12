/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { FaSearch, FaBrain, FaFire } from "react-icons/fa";
import { MdQuiz } from "react-icons/md";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

type SearchResult = {
  _id: string;
  name: string;
  type: "exam" | "topic";
  subjectName?: string;
};

const SearchBar = () => {
  const router = useRouter();
  const { user } = useUser();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const dbUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");
  const profile = useQuery(api.userProfiles.getProfileByUserId, dbUser ? { userId: dbUser._id } : "skip");
  const allExams = useQuery(api.admin.getAllExams) as { _id: Id<"exams">; name: string }[] | undefined;

  const targetExam = allExams?.find((e) =>
    profile?.targetExam
      ? e.name.toLowerCase().includes(profile.targetExam.toLowerCase())
      : false
  );

  const examTopics = useQuery(
    api.admin.getTopicsByExam,
    targetExam ? { examId: targetExam._id } : "skip"
  ) as { _id: Id<"topics">; name: string; subjectId: Id<"subjects"> }[] | undefined;

  const allSubjects = useQuery(
    api.admin.getSubjectsByExam,
    targetExam ? { examId: targetExam._id } : "skip"
  ) as { _id: Id<"subjects">; name: string }[] | undefined;

  const subjectMap = Object.fromEntries((allSubjects ?? []).map((s) => [s._id, s.name]));

  // Search results across exams + topics
  const results: SearchResult[] = query.trim().length < 2 ? [] : [
    ...(allExams ?? [])
      .filter((e) => e.name.toLowerCase().includes(query.toLowerCase()))
      .map((e) => ({ _id: e._id as string, name: e.name, type: "exam" as const })),
    ...(examTopics ?? [])
      .filter((t) => t.name.toLowerCase().includes(query.toLowerCase()))
      .map((t) => ({
        _id: t._id as string,
        name: t.name,
        type: "topic" as const,
        subjectName: subjectMap[t.subjectId],
      })),
  ].slice(0, 8);

  // Suggestions shown on focus with empty query
  const suggestedTopics = (examTopics ?? []).slice(0, 5);
  const showSuggestions = open && query.trim().length < 2;

  const handleSelect = (result: SearchResult) => {
    if (result.type === "topic") {
      router.push(`/quiz/${result._id}`);
    } else {
      router.push(`/categories?q=${encodeURIComponent(result.name)}`);
    }
    setQuery("");
    setOpen(false);
  };

  const handleSuggestionClick = (name: string) => {
    setQuery(name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlighted >= 0 && results[highlighted]) {
        handleSelect(results[highlighted]);
      } else if (query.trim().length >= 2) {
        // No arrow selection — go to categories with query
        router.push(`/categories?q=${encodeURIComponent(query.trim())}`);
        setQuery("");
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setHighlighted(-1);
  }, [results.length]);

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <InputGroup className="max-w-xl h-12 border-[#FF8D28] border-4">
        <InputGroupInput
          placeholder="Search topics, exams..."
          className="text-sm"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
        <InputGroupAddon>
          <FaSearch className="text-[#FF8D28] size-5" />
        </InputGroupAddon>
      </InputGroup>

      {open && (
        <div className="absolute top-14 left-0 right-0 z-50 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden">

          {/* Suggestions on empty query */}
          {showSuggestions && (
            <div className="p-3 space-y-3">
              {allExams && allExams.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-zinc-600 text-xs px-1 uppercase tracking-wide">Exams</p>
                  <div className="flex flex-wrap gap-1.5">
                    {allExams.map((exam) => (
                      <button
                        key={exam._id}
                        onMouseDown={() => handleSuggestionClick(exam.name)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border transition-colors ${
                          targetExam?._id === exam._id
                            ? "bg-[#FF8D28]/15 border-[#FF8D28]/40 text-[#FF8D28]"
                            : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500"
                        }`}
                      >
                        <MdQuiz className="size-3" />
                        {exam.name}
                        {targetExam?._id === exam._id && (
                          <span className="text-[#FF8D28]/60">★</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {suggestedTopics.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-zinc-600 text-xs px-1 uppercase tracking-wide flex items-center gap-1">
                    <FaFire className="size-3 text-orange-500" /> Trending Topics
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedTopics.map((topic) => (
                      <button
                        key={topic._id}
                        onMouseDown={() => handleSuggestionClick(topic.name)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-[#FF8D28]/40 hover:text-white transition-colors"
                      >
                        <FaBrain className="size-3 text-[#FF8D28]" />
                        {topic.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search results */}
          {!showSuggestions && (
            results.length === 0 ? (
              <div className="px-4 py-6 text-center text-zinc-500 text-sm">
                No results for &quot;{query}&quot; — press Enter to browse all
              </div>
            ) : (
              <ul>
                {results.map((result, i) => (
                  <li
                    key={result._id}
                    onMouseDown={() => handleSelect(result)}
                    onMouseEnter={() => setHighlighted(i)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      highlighted === i ? "bg-zinc-800" : "hover:bg-zinc-800/60"
                    }`}
                  >
                    {result.type === "exam"
                      ? <MdQuiz className="size-4 text-[#FF8D28] shrink-0" />
                      : <FaBrain className="size-3.5 text-[#FF8D28] shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{result.name}</p>
                      {result.subjectName && (
                        <p className="text-zinc-500 text-xs truncate">{result.subjectName}</p>
                      )}
                    </div>
                    <span className="text-xs text-zinc-600 shrink-0 capitalize">{result.type}</span>
                  </li>
                ))}
                {/* Footer hint */}
                <li className="px-4 py-2 border-t border-zinc-800 text-xs text-zinc-600 flex items-center gap-1">
                  <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">↵</span>
                  Press Enter to see all results for &quot;{query}&quot;
                </li>
              </ul>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;