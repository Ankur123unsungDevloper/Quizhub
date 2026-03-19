/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Id } from "@/convex/_generated/dataModel";
import { FaFire } from "react-icons/fa";
import { MdBarChart } from "react-icons/md";

type Props = {
  userId: Id<"users">;
};

// Mock data — replace with real Convex query once you build userTopicStats.getByUser
const mockTopics = [
  { name: "Kinematics",        accuracy: 88, attempts: 24 },
  { name: "Laws of Motion",    accuracy: 72, attempts: 18 },
  { name: "Work & Energy",     accuracy: 45, attempts: 12 },
  { name: "Gravitation",       accuracy: 91, attempts: 30 },
  { name: "Thermodynamics",    accuracy: 33, attempts: 9  },
  { name: "Waves",             accuracy: 67, attempts: 15 },
  { name: "Electrostatics",    accuracy: 55, attempts: 21 },
  { name: "Current Elec.",     accuracy: 78, attempts: 27 },
  { name: "Magnetism",         accuracy: 42, attempts: 6  },
  { name: "Optics",            accuracy: 85, attempts: 33 },
  { name: "Modern Physics",    accuracy: 60, attempts: 12 },
  { name: "Semiconductors",    accuracy: 25, attempts: 8  },
];

function getHeatColor(accuracy: number): string {
  if (accuracy >= 85) return "bg-green-500";
  if (accuracy >= 70) return "bg-green-700/70";
  if (accuracy >= 55) return "bg-yellow-600/70";
  if (accuracy >= 40) return "bg-orange-600/70";
  return "bg-red-700/70";
}

function getTextColor(accuracy: number): string {
  if (accuracy >= 85) return "text-green-300";
  if (accuracy >= 70) return "text-green-400";
  if (accuracy >= 55) return "text-yellow-400";
  if (accuracy >= 40) return "text-orange-400";
  return "text-red-400";
}

export const PerformanceHeatmap = ({ userId: _ }: Props) => {
  // TODO: Replace mockTopics with real Convex query when userTopicStats is built
  // const stats = useQuery(api.userTopicStats.getByUser, { userId });
  const topics = mockTopics;

  const avgAccuracy = Math.round(topics.reduce((s, t) => s + t.accuracy, 0) / topics.length);
  const weakTopics = topics.filter(t => t.accuracy < 50);
  const strongTopics = topics.filter(t => t.accuracy >= 80);

  return (
    <div className="bg-zinc-950 border border-yellow-500/20 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <MdBarChart className="size-5 text-yellow-400" />
          <span className="text-white font-semibold text-sm">Performance Heatmap</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 font-bold">ELITE</span>
        </div>
        <span className="text-zinc-400 text-xs">{avgAccuracy}% avg accuracy</span>
      </div>

      <div className="p-5 space-y-5">
        {/* Summary pills */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-white">{avgAccuracy}%</p>
            <p className="text-zinc-500 text-xs mt-0.5">Overall</p>
          </div>
          <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-green-400">{strongTopics.length}</p>
            <p className="text-zinc-500 text-xs mt-0.5">Mastered</p>
          </div>
          <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-red-400">{weakTopics.length}</p>
            <p className="text-zinc-500 text-xs mt-0.5">Need Work</p>
          </div>
        </div>

        {/* Heatmap grid */}
        <div>
          <p className="text-zinc-500 text-xs mb-3 uppercase tracking-wider">Topic Accuracy Map</p>
          <div className="grid grid-cols-4 gap-2">
            {topics.map((t) => (
              <div
                key={t.name}
                className={`${getHeatColor(t.accuracy)} rounded-lg p-2 flex flex-col items-center justify-center text-center cursor-default group relative`}
              >
                <p className="text-white text-xs font-bold">{t.accuracy}%</p>
                <p className="text-white/70 text-[10px] leading-tight mt-0.5 line-clamp-2">{t.name}</p>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap shadow-xl">
                  {t.attempts} attempts
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span>Low</span>
          {["bg-red-700/70","bg-orange-600/70","bg-yellow-600/70","bg-green-700/70","bg-green-500"].map(c => (
            <div key={c} className={`w-5 h-3 rounded ${c}`} />
          ))}
          <span>High</span>
        </div>

        {/* Priority list */}
        {weakTopics.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <FaFire className="text-orange-400" /> Focus on these first
            </p>
            {weakTopics.slice(0, 3).map(t => (
              <div key={t.name} className="flex items-center justify-between py-2 px-3 bg-red-900/10 border border-red-900/30 rounded-lg">
                <span className="text-zinc-300 text-sm">{t.name}</span>
                <span className={`text-sm font-bold ${getTextColor(t.accuracy)}`}>{t.accuracy}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};