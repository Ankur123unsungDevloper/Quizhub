"use client";

import { useState, useRef, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { MdExpandMore } from "react-icons/md";

type SubjectInputProps = {
  label: string;
  selected: string[];
  onChange: (subjects: string[]) => void;
  options: string[];
  disabled?: boolean;
  color?: "green" | "red";
};

export const SubjectInput = ({
  label,
  selected,
  onChange,
  options,
  disabled = false,
  color = "green",
}: SubjectInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Close dropdown on outside click ───────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSubject = (subject: string) => {
    if (selected.includes(subject)) {
      onChange(selected.filter((s) => s !== subject));
    } else {
      onChange([...selected, subject]);
    }
  };

  const removeSubject = (subject: string) => {
    onChange(selected.filter((s) => s !== subject));
  };

  const tagColor =
    color === "green"
      ? "bg-green-900/50 text-green-300 border border-green-700/50"
      : "bg-red-900/50 text-red-300 border border-red-700/50";

  const dotColor =
    color === "green" ? "bg-green-400" : "bg-red-400";

  const activeOptionColor =
    color === "green"
      ? "bg-green-900/40 text-green-300 border-green-700/50"
      : "bg-red-900/40 text-red-300 border-red-700/50";

  return (
    <div className="space-y-2" ref={containerRef}>
      <label className="text-zinc-400 text-sm">{label}</label>

      {/* Input Box */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`min-h-11 w-full bg-zinc-800 border rounded-xl px-3 py-2 flex flex-wrap gap-2 items-center transition cursor-pointer ${
          isOpen
            ? "border-[#FF8D28]"
            : "border-zinc-700 hover:border-zinc-500"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {/* Selected Tags */}
        {selected.length > 0 ? (
          selected.map((subject) => (
            <span
              key={subject}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${tagColor}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
              {subject}
              {!disabled && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSubject(subject);
                  }}
                  className="hover:opacity-70 transition ml-0.5"
                >
                  <FaTimes className="size-2.5" />
                </button>
              )}
            </span>
          ))
        ) : (
          <span className="text-zinc-500 text-sm">
            {disabled ? "Not set" : `Click to select ${label.toLowerCase()}...`}
          </span>
        )}

        {/* Chevron */}
        {!disabled && (
          <MdExpandMore
            className={`ml-auto text-zinc-400 size-5 transition-transform duration-200 shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="relative z-50">
          <div className="absolute top-1 left-0 right-0 bg-zinc-800 border border-zinc-700 rounded-xl p-3 shadow-xl shadow-black/50">

            <p className="text-zinc-500 text-xs mb-3 px-1">
              Click to toggle subjects
            </p>

            <div className="flex flex-wrap gap-2">
              {options.map((subject) => {
                const isSelected = selected.includes(subject);
                return (
                  <button
                    key={subject}
                    onClick={() => toggleSubject(subject)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                      isSelected
                        ? activeOptionColor
                        : "bg-zinc-700/50 text-zinc-300 border-zinc-600 hover:bg-zinc-700 hover:text-white"
                    }`}
                  >
                    {isSelected ? "✓ " : ""}{subject}
                  </button>
                );
              })}
            </div>

            {selected.length > 0 && (
              <button
                onClick={() => onChange([])}
                className="mt-3 text-xs text-zinc-500 hover:text-red-400 transition px-1"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};