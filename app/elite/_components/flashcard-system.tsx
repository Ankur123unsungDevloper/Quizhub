/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { FaCheck, FaTimes, FaRedo } from "react-icons/fa";
import { HiLightningBolt } from "react-icons/hi";
import { cn } from "@/lib/utils";

type Flashcard = { front: string; back: string; difficulty?: "easy" | "medium" | "hard" };

type Props = {
  cards?: Flashcard[];
  topicName?: string;
};

const DEFAULT_CARDS: Flashcard[] = [
  { front: "What is Newton's First Law?", back: "An object remains at rest or in uniform motion unless acted upon by an external force. Also called the Law of Inertia." },
  { front: "Define Kinetic Energy", back: "KE = ½mv² — Energy possessed by a body due to its motion. Depends on mass and square of velocity." },
  { front: "What is Ohm's Law?", back: "V = IR — Voltage equals Current times Resistance. Applies to ohmic conductors at constant temperature." },
  { front: "Define pH Scale", back: "pH = -log[H⁺]. Range 0–14. pH < 7 is acidic, pH = 7 is neutral, pH > 7 is basic/alkaline." },
  { front: "What is Photosynthesis?", back: "6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. Plants convert sunlight into glucose using chlorophyll." },
  { front: "State Avogadro's Law", back: "Equal volumes of all gases at same temperature and pressure contain equal number of molecules (6.022 × 10²³)." },
];

export const FlashcardSystem = ({ cards = DEFAULT_CARDS, topicName = "Physics" }: Props) => {
  const [deck, setDeck] = useState(cards);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [session, setSession] = useState({ correct: 0, wrong: 0, total: 0 });
  const [done, setDone] = useState(false);

  const current = deck[currentIdx];

  const respond = (knew: boolean) => {
    setSession(s => ({
      correct: s.correct + (knew ? 1 : 0),
      wrong: s.wrong + (knew ? 0 : 1),
      total: s.total + 1,
    }));

    // Spaced repetition: if wrong, push card back into deck later
    if (!knew) {
      const newDeck = [...deck];
      const card = newDeck.splice(currentIdx, 1)[0];
      const insertAt = Math.min(currentIdx + 3, newDeck.length);
      newDeck.splice(insertAt, 0, card);
      setDeck(newDeck);
    }

    setFlipped(false);
    setTimeout(() => {
      if (currentIdx >= deck.length - 1) {
        setDone(true);
      } else {
        setCurrentIdx(i => i + 1);
      }
    }, 150);
  };

  const restart = () => {
    setDeck(cards);
    setCurrentIdx(0);
    setFlipped(false);
    setSession({ correct: 0, wrong: 0, total: 0 });
    setDone(false);
  };

  const accuracy = session.total > 0 ? Math.round((session.correct / session.total) * 100) : 0;

  return (
    <div className="bg-zinc-950 border border-yellow-500/20 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <HiLightningBolt className="size-4 text-yellow-400" />
          <span className="text-white font-semibold text-sm">Flashcards</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 font-bold">ELITE</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-green-400">{session.correct} ✓</span>
          <span className="text-red-400">{session.wrong} ✗</span>
          <span className="text-zinc-500">{currentIdx + 1}/{deck.length}</span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-500"
            style={{ width: `${((currentIdx) / deck.length) * 100}%` }}
          />
        </div>

        {done ? (
          /* Done screen */
          <div className="text-center py-8 space-y-4">
            <div className="text-5xl">
              {accuracy >= 80 ? "🏆" : accuracy >= 60 ? "💪" : "📚"}
            </div>
            <div>
              <p className="text-white font-bold text-xl">{accuracy}% Accuracy</p>
              <p className="text-zinc-400 text-sm mt-1">
                {session.correct} correct · {session.wrong} need review
              </p>
            </div>
            <div className="text-sm text-zinc-500">
              {accuracy >= 80
                ? "Excellent! You've mastered this topic 🎯"
                : accuracy >= 60
                ? "Good progress! Review the missed cards 📖"
                : "Keep practicing! Repetition is key 🔄"}
            </div>
            <button onClick={restart}
              className="flex items-center gap-2 mx-auto px-6 py-2.5 rounded-xl bg-[#FF8D28] text-black font-bold text-sm hover:opacity-90 transition">
              <FaRedo className="size-3" /> Study Again
            </button>
          </div>
        ) : (
          <>
            {/* Flashcard */}
            <div
              className="relative cursor-pointer select-none"
              onClick={() => setFlipped(f => !f)}
              style={{ perspective: "1000px" }}
            >
              <div
                className="relative w-full transition-transform duration-500"
                style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
              >
                {/* Front */}
                <div
                  className="w-full min-h-36 bg-zinc-900 border-2 border-zinc-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Question</p>
                  <p className="text-white font-semibold text-base leading-relaxed">{current?.front}</p>
                  <p className="text-zinc-600 text-xs mt-4">Tap to reveal answer</p>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 w-full min-h-36 bg-zinc-800 border-2 border-yellow-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <p className="text-xs text-yellow-400 mb-3 uppercase tracking-wider">Answer</p>
                  <p className="text-zinc-200 text-sm leading-relaxed">{current?.back}</p>
                </div>
              </div>
            </div>

            {/* Response buttons — only show when flipped */}
            <div className={cn(
              "flex gap-3 transition-all duration-300",
              flipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
            )}>
              <button onClick={() => respond(false)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-900/30 border border-red-700/50 text-red-400 hover:bg-red-900/50 transition font-medium text-sm">
                <FaTimes className="size-3.5" /> Didn&apos;t Know
              </button>
              <button onClick={() => respond(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-900/30 border border-green-700/50 text-green-400 hover:bg-green-900/50 transition font-medium text-sm">
                <FaCheck className="size-3.5" /> Got It!
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};