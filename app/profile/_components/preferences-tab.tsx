"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CircularSlider } from "./circular-slider";
import {
  MdNotifications, MdAccessTime, MdFlag,
  MdQuiz, MdPalette, MdSpeed,
} from "react-icons/md";
import { FaSave } from "react-icons/fa";

type Props = {
  studyHours: number;
  setStudyHours: (v: number) => void;
  studyGoal: string;
  setStudyGoal: (v: string) => void;
  reminderEnabled: boolean;
  setReminderEnabled: (v: boolean) => void;
  handleSave: () => Promise<void>;
};

const goals = [
  { label: "Crack JEE Top 1000", icon: "🎯" },
  { label: "Score 90%+ Boards", icon: "📊" },
  { label: "Clear NEET 600+", icon: "🏥" },
  { label: "Get into IIT", icon: "🏛️" },
  { label: "Improve weak subjects", icon: "📈" },
  { label: "Daily streak", icon: "🔥" },
];

const quizSettings = [
  { id: "timer", label: "Quiz Timer", description: "Enable countdown during quizzes" },
  { id: "sound", label: "Sound Effects", description: "Play sounds on correct/wrong answers" },
  { id: "instant", label: "Instant Feedback", description: "Show answer immediately after each question" },
  { id: "shuffle", label: "Shuffle Questions", description: "Randomize question order every quiz" },
];

const Toggle = ({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`w-11 h-6 rounded-full transition-all duration-300 relative shrink-0 ${
      enabled ? "bg-[#FF8D28]" : "bg-zinc-700"
    }`}
  >
    <div
      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
        enabled ? "left-6" : "left-1"
      }`}
    />
  </button>
);

export const PreferencesTab = ({
  studyHours,
  setStudyHours,
  studyGoal,
  setStudyGoal,
  reminderEnabled,
  setReminderEnabled,
  handleSave,
}: Props) => {
  const [saving, setSaving] = useState(false);
  const [quizToggles, setQuizToggles] = useState({
    timer: true,
    sound: false,
    instant: true,
    shuffle: true,
  });
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  const onSave = async () => {
    setSaving(true);
    try {
      await handleSave();
      toast.success("Preferences saved!");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">

      {/* Study Goal */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <MdFlag className="text-[#FF8D28] size-5" />
          Study Goal
        </h2>
        <p className="text-zinc-400 text-sm">
          What is your main goal right now?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {goals.map((g) => (
            <button
              key={g.label}
              onClick={() => setStudyGoal(g.label)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition border text-left ${
                studyGoal === g.label
                  ? "bg-[#FF8D28]/10 text-[#FF8D28] border-[#FF8D28]/30"
                  : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-zinc-500 hover:text-white"
              }`}
            >
              <span className="text-xl">{g.icon}</span>
              {g.label}
              {studyGoal === g.label && (
                <span className="ml-auto text-[#FF8D28]">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Study Hours */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <MdAccessTime className="text-[#FF8D28] size-5" />
          Daily Study Hours
        </h2>
        <div className="flex justify-center py-2">
          <CircularSlider
            value={studyHours}
            onChange={setStudyHours}
            min={1}
            max={12}
            size={180}
          />
        </div>
      </div>

      {/* Default Difficulty */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <MdSpeed className="text-[#FF8D28] size-5" />
          Default Quiz Difficulty
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {(["easy", "medium", "hard"] as const).map((d) => {
            const config = {
              easy:   { label: "Easy",   color: "text-green-400",  bg: "bg-green-900/30  border-green-700/50",  active: "bg-green-900/50  border-green-500" },
              medium: { label: "Medium", color: "text-yellow-400", bg: "bg-yellow-900/30 border-yellow-700/50", active: "bg-yellow-900/50 border-yellow-500" },
              hard:   { label: "Hard",   color: "text-red-400",    bg: "bg-red-900/30    border-red-700/50",    active: "bg-red-900/50    border-red-500"   },
            }[d];
            return (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                  difficulty === d
                    ? `${config.active} ${config.color}`
                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"
                }`}
              >
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quiz Settings */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <MdQuiz className="text-[#FF8D28] size-5" />
          Quiz Settings
        </h2>
        <div className="space-y-4">
          {quizSettings.map((setting) => (
            <div key={setting.id} className="flex items-center justify-between py-1">
              <div>
                <p className="text-white text-sm font-medium">{setting.label}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{setting.description}</p>
              </div>
              <Toggle
                enabled={quizToggles[setting.id as keyof typeof quizToggles]}
                onChange={(v) =>
                  setQuizToggles((prev) => ({ ...prev, [setting.id]: v }))
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <MdPalette className="text-[#FF8D28] size-5" />
          Appearance
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Dark",   bg: "bg-zinc-950 border-zinc-700" },
            { label: "Darker", bg: "bg-black border-zinc-800"    },
            { label: "System", bg: "bg-gradient-to-br from-zinc-950 to-zinc-700 border-zinc-600" },
          ].map((theme) => (
            <button
              key={theme.label}
              className={`h-16 rounded-xl border-2 ${theme.bg} flex items-end p-2 hover:border-[#FF8D28]/50 transition`}
            >
              <span className="text-zinc-400 text-xs">{theme.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <MdNotifications className="text-[#FF8D28] size-5" />
          Notifications
        </h2>
        <div className="space-y-4">
          {[
            {
              label: "Daily Study Reminder",
              description: "Get reminded to complete your daily quiz goal",
              enabled: reminderEnabled,
              onChange: setReminderEnabled,
            },
            {
              label: "Achievement Alerts",
              description: "Notify when you earn a new achievement",
              enabled: true,
              onChange: () => {},
            },
            {
              label: "Weekly Progress Report",
              description: "Summary of your weekly performance",
              enabled: false,
              onChange: () => {},
            },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <div>
                <p className="text-white text-sm font-medium">{item.label}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{item.description}</p>
              </div>
              <Toggle enabled={item.enabled} onChange={item.onChange} />
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <Button
        onClick={onSave}
        disabled={saving}
        className="w-full bg-[#FF8D28] hover:bg-[#ff8d28d9] text-white py-6 text-base"
      >
        <FaSave className="size-4 mr-2" />
        {saving ? "Saving..." : "Save Preferences"}
      </Button>
    </div>
  );
};