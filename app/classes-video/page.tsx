/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/app/(platform)/navbar/navbar";
import Footer from "@/app/(platform)/footer/footer";
import { MdPlayCircle, MdNotifications } from "react-icons/md";
import { FaChalkboardTeacher, FaGraduationCap, FaBookOpen } from "react-icons/fa";
import { HiLightBulb } from "react-icons/hi";

const features = [
  {
    icon: <FaChalkboardTeacher className="size-6 text-[#FF8D28]" />,
    title: "Expert-Led Lessons",
    desc: "Video lectures from top educators covering every subject in your exam syllabus.",
  },
  {
    icon: <MdPlayCircle className="size-6 text-[#FF8D28]" />,
    title: "Playlists & Chapters",
    desc: "Organized chapter-wise playlists so you never lose your place in the syllabus.",
  },
  {
    icon: <FaBookOpen className="size-6 text-[#FF8D28]" />,
    title: "Quiz After Every Video",
    desc: "Reinforce what you just watched with an instant AI-generated quiz on the topic.",
  },
  {
    icon: <HiLightBulb className="size-6 text-[#FF8D28]" />,
    title: "AI Study Notes",
    desc: "Auto-generated notes from each video so you can revise without re-watching.",
  },
  {
    icon: <FaGraduationCap className="size-6 text-[#FF8D28]" />,
    title: "Exam-Targeted Content",
    desc: "Content filtered by your target exam — JEE, NEET, UPSC and more.",
  },
];

// Animated countdown — just days until a fake launch date
function useCountdown() {
  const target = new Date("2026-06-01T00:00:00");
  const calc = () => {
    const diff = target.getTime() - Date.now();
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { d, h, m, s };
  };
  const [time, setTime] = useState(calc());
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}

const CountUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center gap-1">
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-3 min-w-18 text-center">
      <span className="text-3xl font-bold text-white tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
    </div>
    <span className="text-zinc-500 text-xs uppercase tracking-widest">{label}</span>
  </div>
);

export default function VideosPage() {
  const { d, h, m, s } = useCountdown();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <Navbar />

      <main className="flex-1 w-full flex flex-col items-center pt-28 pb-16 px-6">

        {/* Hero */}
        <div className="flex flex-col items-center text-center max-w-2xl mt-10">
          {/* Badge */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF8D28]/10 border border-[#FF8D28]/30 text-[#FF8D28] text-xs font-medium mb-6">
            <MdPlayCircle className="size-4" />
            Coming Soon
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Classes{" "}
            <span className="text-[#FF8D28]">Videos</span>
          </h1>
          <p className="mt-5 text-zinc-400 text-lg leading-relaxed">
            We&apos;re building a full video learning experience — curated lectures,
            chapter playlists, and AI-powered notes — all connected to your quiz journey.
          </p>
        </div>

        {/* Countdown */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <p className="text-zinc-500 text-sm uppercase tracking-widest">Launching in</p>
          <div className="flex items-start gap-4">
            <CountUnit value={d} label="Days" />
            <span className="text-zinc-600 text-3xl font-bold mt-3">:</span>
            <CountUnit value={h} label="Hours" />
            <span className="text-zinc-600 text-3xl font-bold mt-3">:</span>
            <CountUnit value={m} label="Mins" />
            <span className="text-zinc-600 text-3xl font-bold mt-3">:</span>
            <CountUnit value={s} label="Secs" />
          </div>
        </div>

        {/* Notify me */}
        <div className="mt-10 w-full max-w-md">
          {submitted ? (
            <div className="flex items-center justify-center gap-2 text-green-400 bg-green-400/10 border border-green-400/20 rounded-xl px-6 py-4">
              <MdNotifications className="size-5" />
              <span className="text-sm font-medium">You&apos;re on the list! We&apos;ll notify you at launch.</span>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-[#FF8D28] transition"
              />
              <button
                onClick={() => { if (email) setSubmitted(true); }}
                className="px-5 py-3 bg-[#FF8D28] hover:bg-[#FF8D28]/90 text-white text-sm font-semibold rounded-xl transition whitespace-nowrap"
              >
                Notify Me
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-full max-w-3xl border-t border-zinc-800 mt-16 mb-12" />

        {/* Features */}
        <div className="w-full max-w-3xl">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            What&apos;s Coming
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex gap-4 p-5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-[#FF8D28]/40 transition"
              >
                <div className="shrink-0 mt-0.5">{f.icon}</div>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-zinc-500 text-xs mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
            {/* Last card - full width */}
            <div className="sm:col-span-2 flex gap-4 p-5 bg-[#FF8D28]/5 border border-[#FF8D28]/20 rounded-2xl">
              <div className="shrink-0 mt-0.5">
                <MdNotifications className="size-6 text-[#FF8D28]" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Be the First to Know</p>
                <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
                  Enter your email above and we&apos;ll notify you the moment Classes Videos goes live. Early users get priority access.
                </p>
              </div>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}