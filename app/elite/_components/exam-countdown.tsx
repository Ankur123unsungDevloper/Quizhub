"use client";

import { useState, useEffect } from "react";
import { FaClock, FaFire, FaCheck } from "react-icons/fa";
import { MdEdit } from "react-icons/md";

type DailyTask = { label: string; done: boolean };

const DEFAULT_TASKS: DailyTask[] = [
  { label: "Complete 1 mock test",          done: false },
  { label: "Review 20 flashcards",          done: false },
  { label: "Solve 10 PYQ questions",        done: false },
  { label: "Read formula sheet (1 chapter)",done: false },
  { label: "Watch 1 concept video",         done: false },
];

export const ExamCountdown = () => {
  const [examDate, setExamDate] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("quizhub_exam_date") ?? "";
  });
  const [editing, setEditing] = useState(!examDate);
  const [inputDate, setInputDate] = useState(examDate);
  const [tasks, setTasks] = useState<DailyTask[]>(DEFAULT_TASKS);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!examDate) return;
    const tick = () => {
      const diff = new Date(examDate).getTime() - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [examDate]);

  const saveDate = () => {
    if (!inputDate) return;
    setExamDate(inputDate);
    localStorage.setItem("quizhub_exam_date", inputDate);
    setEditing(false);
  };

  const toggleTask = (i: number) => {
    setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, done: !t.done } : t));
  };

  const doneCount = tasks.filter(t => t.done).length;
  const urgency = timeLeft.days <= 7 ? "red" : timeLeft.days <= 30 ? "orange" : "green";

  const urgencyColors = {
    red:    { text: "text-red-400",    bg: "bg-red-900/20",    border: "border-red-700/30"    },
    orange: { text: "text-orange-400", bg: "bg-orange-900/20", border: "border-orange-700/30" },
    green:  { text: "text-green-400",  bg: "bg-green-900/20",  border: "border-green-700/30"  },
  }[urgency];

  return (
    <div className="bg-zinc-950 border border-yellow-500/20 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <FaClock className="size-4 text-yellow-400" />
          <span className="text-white font-semibold text-sm">Exam Countdown</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 font-bold">ELITE</span>
        </div>
        {examDate && (
          <button onClick={() => setEditing(true)}
            className="text-zinc-500 hover:text-white transition">
            <MdEdit className="size-4" />
          </button>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* Date input */}
        {editing ? (
          <div className="space-y-3">
            <p className="text-zinc-400 text-sm">When is your exam?</p>
            <input
              type="date"
              value={inputDate}
              onChange={e => setInputDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF8D28]"
            />
            <button onClick={saveDate}
              className="w-full py-2.5 rounded-xl bg-[#FF8D28] text-black font-bold text-sm hover:opacity-90 transition">
              Set Exam Date →
            </button>
          </div>
        ) : (
          <>
            {/* Countdown display */}
            <div className={`${urgencyColors.bg} ${urgencyColors.border} border rounded-2xl p-4`}>
              <p className="text-zinc-400 text-xs text-center mb-3 uppercase tracking-wider">Time until exam</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { val: timeLeft.days,    label: "Days"    },
                  { val: timeLeft.hours,   label: "Hours"   },
                  { val: timeLeft.minutes, label: "Minutes" },
                  { val: timeLeft.seconds, label: "Seconds" },
                ].map(({ val, label }) => (
                  <div key={label} className="bg-zinc-900 rounded-xl py-2">
                    <p className={`text-2xl font-black ${urgencyColors.text}`}>
                      {String(val).padStart(2, "0")}
                    </p>
                    <p className="text-zinc-500 text-[10px]">{label}</p>
                  </div>
                ))}
              </div>
              {timeLeft.days <= 7 && (
                <p className="text-center text-red-400 text-xs mt-3 font-medium animate-pulse">
                  ⚡ Final stretch! Stay focused!
                </p>
              )}
            </div>

            {/* Daily targets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-zinc-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <FaFire className="text-orange-400" /> Today&apos;s Targets
                </p>
                <span className="text-xs text-zinc-500">{doneCount}/{tasks.length} done</span>
              </div>

              {/* Progress */}
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-[#FF8D28] to-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${(doneCount / tasks.length) * 100}%` }}
                />
              </div>

              {tasks.map((task, i) => (
                <div
                  key={i}
                  onClick={() => toggleTask(i)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    task.done
                      ? "bg-green-900/10 border-green-700/30"
                      : "bg-zinc-900 border-zinc-800 hover:border-zinc-600"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    task.done ? "bg-green-500 border-green-500" : "border-zinc-600"
                  }`}>
                    {task.done && <FaCheck className="size-2.5 text-white" />}
                  </div>
                  <span className={`text-sm ${task.done ? "text-zinc-500 line-through" : "text-zinc-300"}`}>
                    {task.label}
                  </span>
                </div>
              ))}

              {doneCount === tasks.length && (
                <div className="text-center py-2 text-green-400 text-sm font-semibold">
                  🎉 All targets complete! Great work today!
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};