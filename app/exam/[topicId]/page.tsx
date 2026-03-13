/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUser } from "@clerk/nextjs";
import { FaClock, FaLock, FaCheckCircle, FaTimesCircle, FaMinus } from "react-icons/fa";
import { HiLightningBolt } from "react-icons/hi";
import { MdWarning } from "react-icons/md";

// ─── Constants ────────────────────────────────────────────────────────────────
const EXAM_DURATION_SECONDS = 45 * 60; // 45 minutes
const MARKS_CORRECT = 4;
const MARKS_WRONG = -1;
const TOTAL_QUESTIONS = 30;

// ─── Types ────────────────────────────────────────────────────────────────────
type Question = {
  _id: Id<"questions">;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
};

type AnswerState = {
  selected: number | null;  // index of selected option, null = unattempted
  locked: boolean;          // once selected → permanently locked
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function calcScore(answers: Record<string, AnswerState>, questions: Question[]): {
  score: number; correct: number; wrong: number; unattempted: number;
} {
  let score = 0, correct = 0, wrong = 0, unattempted = 0;
  for (const q of questions) {
    const a = answers[q._id];
    if (!a || a.selected === null) { unattempted++; continue; }
    if (a.selected === q.correctOptionIndex) { score += MARKS_CORRECT; correct++; }
    else { score += MARKS_WRONG; wrong++; }
  }
  return { score, correct, wrong, unattempted };
}

// ─── Question Nav Button ──────────────────────────────────────────────────────
const NavBtn = ({
  num, state, active, onClick,
}: {
  num: number;
  state: "unattempted" | "answered";
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`size-9 rounded-lg text-xs font-bold transition border ${
      active
        ? "bg-indigo-600 border-indigo-400 text-white"
        : state === "answered"
        ? "bg-zinc-700 border-zinc-600 text-white"
        : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-indigo-500 hover:text-white"
    }`}
  >
    {num}
  </button>
);

// ─── Main Exam Page ───────────────────────────────────────────────────────────
export default function ExamPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const router = useRouter();
  const { user } = useUser();

  // ── Data ──
  const topic = useQuery(api.admin.getTopicWithExam, { topicId: topicId as Id<"topics"> });
  const questions = useQuery(api.admin.getQuestionsByTopic, { topicId: topicId as Id<"topics"> });
  const dbUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");
  const saveResult = useAction(api.attempts.saveExamResult);

  // ── Exam State ──
  type ExamState = "landing" | "active" | "finished";
  const [examState, setExamState] = useState<ExamState>("landing");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SECONDS);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [tabWarnings, setTabWarnings] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Slice to max questions
  const examQuestions = (questions ?? []).slice(0, TOTAL_QUESTIONS) as Question[];

  // ── Timer ──
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const handleAutoSubmit = useCallback(() => {
    stopTimer();
    setExamState("finished");
  }, [stopTimer]);

  useEffect(() => {
    if (examState !== "active") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { handleAutoSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => stopTimer();
  }, [examState, handleAutoSubmit, stopTimer]);

  // ── Tab switch detection ──
  useEffect(() => {
    if (examState !== "active") return;
    const handleVisibility = () => {
      if (document.hidden) {
        setTabWarnings((w) => w + 1);
        setShowTabWarning(true);
        setTimeout(() => setShowTabWarning(false), 3000);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [examState]);

  // ── Select answer (locked after selection) ──
  const selectAnswer = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => {
      if (prev[questionId]?.locked) return prev; // already locked
      return {
        ...prev,
        [questionId]: { selected: optionIndex, locked: true },
      };
    });
  };

  // ── Submit ──
  const handleSubmit = async () => {
    stopTimer();
    setExamState("finished");
    setShowSubmitDialog(false);
    if (!dbUser || examQuestions.length === 0) return;
    const { score, correct, wrong } = calcScore(answers, examQuestions);
    setIsSaving(true);
    try {
      await saveResult({
        userId: dbUser._id,
        topicId: topicId as Id<"topics">,
        examId: topic?.examId as Id<"exams">,
        answers: examQuestions.map((q) => ({
          questionId: q._id,
          selectedAnswer: answers[q._id]?.selected ?? -1,
          isCorrect: answers[q._id]?.selected === q.correctOptionIndex,
        })),
        score,
        totalQuestions: examQuestions.length,
        correctAnswers: correct,
        wrongAnswers: wrong,
        timeTaken: EXAM_DURATION_SECONDS - timeLeft,
      });
    } catch (e) {
      console.error("Failed to save exam result", e);
    } finally {
      setIsSaving(false);
    }
  };

  const { score, correct, wrong, unattempted } = calcScore(answers, examQuestions);
  const percentage = examQuestions.length > 0
    ? Math.round((correct / examQuestions.length) * 100)
    : 0;

  // ─────────────────────── LANDING ─────────────────────────────────────────
  if (examState === "landing") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center gap-6">
          <div className="size-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
            <HiLightningBolt className="size-8 text-indigo-400" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-white mb-1">
              {topic?.name ?? "Loading..."}
            </h1>
            <p className="text-zinc-500 text-sm">Exam Mode</p>
          </div>

          {/* Rules */}
          <div className="w-full bg-zinc-800/50 rounded-xl p-4 space-y-2.5 text-sm">
            {[
              { icon: <FaClock className="text-indigo-400" />, text: "45 minutes total time" },
              { icon: <FaCheckCircle className="text-green-400" />, text: "+4 marks for every correct answer" },
              { icon: <FaTimesCircle className="text-red-400" />, text: "−1 mark for every wrong answer" },
              { icon: <FaMinus className="text-zinc-400" />, text: "No penalty for unattempted questions" },
              { icon: <FaLock className="text-yellow-400" />, text: "Answers are locked once selected — no changes" },
              { icon: <MdWarning className="text-orange-400" />, text: "Tab switching is monitored and recorded" },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-3 text-zinc-300">
                <span className="shrink-0">{r.icon}</span>
                {r.text}
              </div>
            ))}
          </div>

          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1 border-zinc-700 text-zinc-400 hover:text-white"
              onClick={() => router.back()}
            >
              Go Back
            </Button>
            <Button
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
              onClick={() => setExamState("active")}
              disabled={!questions || questions.length === 0}
            >
              Start Exam
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────── RESULT ──────────────────────────────────────────
  if (examState === "finished") {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full space-y-6">

          {/* Score card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            <div className="size-20 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-extrabold text-indigo-400">{score}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-1">Exam Completed</h1>
            <p className="text-zinc-500 text-sm">{topic?.name}</p>

            <div className="grid grid-cols-4 gap-3 mt-6">
              {[
                { label: "Score", value: score, color: "text-indigo-400" },
                { label: "Correct", value: correct, color: "text-green-400" },
                { label: "Wrong", value: wrong, color: "text-red-400" },
                { label: "Skipped", value: unattempted, color: "text-zinc-400" },
              ].map((s) => (
                <div key={s.label} className="bg-zinc-800 rounded-xl p-3">
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mt-6">
              <div className="flex justify-between text-xs text-zinc-500 mb-1">
                <span>Accuracy</span>
                <span>{percentage}%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {tabWarnings > 0 && (
              <p className="mt-4 text-xs text-orange-400 flex items-center justify-center gap-1">
                <MdWarning /> Tab switched {tabWarnings} time{tabWarnings > 1 ? "s" : ""} during exam
              </p>
            )}
          </div>

          {/* Answer review */}
          <div className="space-y-4">
            <h2 className="text-white font-semibold text-lg">Answer Review</h2>
            {examQuestions.map((q, idx) => {
              const ans = answers[q._id];
              const isCorrect = ans?.selected === q.correctOptionIndex;
              const isWrong = ans?.selected !== undefined && ans.selected !== null && ans.selected !== q.correctOptionIndex;
              const isSkipped = !ans || ans.selected === null;
              return (
                <div key={q._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-zinc-600 text-xs mt-0.5 shrink-0">Q{idx + 1}.</span>
                    <p className="text-white text-sm">{q.questionText}</p>
                    <span className={`ml-auto shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isCorrect ? "bg-green-500/20 text-green-400"
                      : isWrong ? "bg-red-500/20 text-red-400"
                      : "bg-zinc-700 text-zinc-400"
                    }`}>
                      {isCorrect ? `+${MARKS_CORRECT}` : isWrong ? `${MARKS_WRONG}` : "0"}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {q.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`text-xs px-3 py-2 rounded-lg border ${
                          i === q.correctOptionIndex
                            ? "border-green-500/50 bg-green-500/10 text-green-300"
                            : ans?.selected === i && i !== q.correctOptionIndex
                            ? "border-red-500/50 bg-red-500/10 text-red-300"
                            : "border-zinc-700 text-zinc-400"
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <p className="mt-3 text-xs text-zinc-500 border-t border-zinc-800 pt-2">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 pb-8">
            <Button
              variant="outline"
              className="flex-1 border-zinc-700 text-zinc-400 hover:text-white"
              onClick={() => router.push("/quizzes")}
            >
              Back to Quizzes
            </Button>
            <Button
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white"
              onClick={() => {
                setAnswers({});
                setTimeLeft(EXAM_DURATION_SECONDS);
                setCurrentQ(0);
                setTabWarnings(0);
                setExamState("landing");
              }}
            >
              Retry Exam
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────── ACTIVE EXAM ─────────────────────────────────────
  const currentQuestion = examQuestions[currentQ];
  const currentAnswer = currentQuestion ? answers[currentQuestion._id] : null;
  const isTimeLow = timeLeft < 300; // last 5 mins

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">

      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-zinc-900 border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HiLightningBolt className="text-indigo-400 size-5" />
          <span className="text-white font-semibold text-sm line-clamp-1 max-w-xs">
            {topic?.name}
          </span>
          {tabWarnings > 0 && (
            <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full flex items-center gap-1">
              <MdWarning className="size-3" /> {tabWarnings} tab switch{tabWarnings > 1 ? "es" : ""}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-bold text-sm ${
            isTimeLow
              ? "bg-red-500/20 text-red-400 animate-pulse"
              : "bg-zinc-800 text-white"
          }`}>
            <FaClock className="size-3.5" />
            {formatTime(timeLeft)}
          </div>

          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
            onClick={() => setShowSubmitDialog(true)}
          >
            Submit Exam
          </Button>
        </div>
      </div>

      {/* Tab warning toast */}
      {showTabWarning && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-orange-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
          <MdWarning className="size-4" />
          Tab switch detected! ({tabWarnings} warning{tabWarnings > 1 ? "s" : ""})
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">

        {/* Question panel */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-2xl mx-auto">

            {/* Progress */}
            <div className="flex items-center justify-between mb-4 text-xs text-zinc-500">
              <span>Question {currentQ + 1} of {examQuestions.length}</span>
              <span>{Object.values(answers).filter(a => a.locked).length} answered</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full mb-8">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${((currentQ + 1) / examQuestions.length) * 100}%` }}
              />
            </div>

            {/* Question */}
            {currentQuestion ? (
              <>
                <p className="text-white text-lg font-semibold mb-6 leading-relaxed">
                  {currentQuestion.questionText}
                </p>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((opt, i) => {
                    const isSelected = currentAnswer?.selected === i;
                    const isLocked = currentAnswer?.locked;
                    return (
                      <button
                        key={i}
                        disabled={!!isLocked}
                        onClick={() => selectAnswer(currentQuestion._id, i)}
                        className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm transition ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-500/15 text-white"
                            : isLocked
                            ? "border-zinc-700 bg-zinc-800/40 text-zinc-500 cursor-not-allowed"
                            : "border-zinc-700 bg-zinc-800/60 text-zinc-300 hover:border-indigo-400 hover:text-white"
                        }`}
                      >
                        <span className="inline-flex size-5 rounded-full border border-current mr-3 items-center justify-center text-xs shrink-0">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                        {isSelected && isLocked && (
                          <span className="float-right text-indigo-400"><FaLock className="size-3" /></span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Locked notice */}
                {currentAnswer?.locked && (
                  <p className="mt-4 text-xs text-zinc-600 flex items-center gap-1.5">
                    <FaLock className="size-2.5" /> Answer locked — cannot be changed
                  </p>
                )}

                {/* Nav arrows */}
                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 text-zinc-400 hover:text-white"
                    onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
                    disabled={currentQ === 0}
                  >
                    ← Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 text-zinc-400 hover:text-white"
                    onClick={() => setCurrentQ((q) => Math.min(examQuestions.length - 1, q + 1))}
                    disabled={currentQ === examQuestions.length - 1}
                  >
                    Next →
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-zinc-500 text-center py-20">Loading questions...</div>
            )}
          </div>
        </div>

        {/* Question nav panel */}
        <div className="w-64 shrink-0 border-l border-zinc-800 p-4 overflow-y-auto hidden md:block">
          <p className="text-zinc-500 text-xs mb-3 uppercase tracking-wide font-medium">Questions</p>
          <div className="grid grid-cols-5 gap-1.5">
            {examQuestions.map((q, i) => (
              <NavBtn
                key={q._id}
                num={i + 1}
                state={answers[q._id]?.locked ? "answered" : "unattempted"}
                active={i === currentQ}
                onClick={() => setCurrentQ(i)}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 space-y-1.5 text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded bg-indigo-600" /> Current
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded bg-zinc-700" /> Answered
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded bg-zinc-900 border border-zinc-700" /> Unattempted
            </div>
          </div>

          {/* Live score */}
          <div className="mt-6 bg-zinc-800 rounded-xl p-3 space-y-1 text-xs">
            <p className="text-zinc-400 font-medium mb-2">Live Score</p>
            <div className="flex justify-between text-zinc-300">
              <span>Score</span><span className="text-indigo-400 font-bold">{score}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Correct</span><span className="text-green-400">{correct}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Wrong</span><span className="text-red-400">{wrong}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Skipped</span><span>{unattempted}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit confirmation dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              You have answered {Object.values(answers).filter(a => a.locked).length} of {examQuestions.length} questions.
              {unattempted > 0 && ` ${unattempted} question${unattempted > 1 ? "s" : ""} will be left unattempted.`}
              {" "}This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700 text-zinc-400 hover:text-white">
              Continue Exam
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
              onClick={handleSubmit}
            >
              Submit & See Results
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}