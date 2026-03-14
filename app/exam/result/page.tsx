"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { FaCheckCircle, FaTimesCircle, FaMinus } from "react-icons/fa";
import { HiDocumentText } from "react-icons/hi";

export default function PaperExamResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const submissionId = searchParams.get("id") as Id<"paperExamSubmissions"> | null;

  const result = useQuery(
    api.paperExamHelpers.getSubmissionResult,
    submissionId ? { submissionId } : "skip"
  );

  if (!result) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="size-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (result.status !== "graded") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="text-white font-semibold">Results not ready yet</p>
          <p className="text-zinc-500 text-sm">Please wait a moment...</p>
          <Button
            onClick={() => router.push(`/paper-exam/processing?id=${submissionId}`)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            Go to Processing Page
          </Button>
        </div>
      </div>
    );
  }

  const percentage = result.percentage ?? 0;
  const marksObtained = result.marksObtained ?? 0;
  const totalMarks = result.totalMarks;
  const feedback = result.feedback ?? [];

  const grade =
    percentage >= 90 ? { label: "Outstanding", color: "text-emerald-400" } :
    percentage >= 75 ? { label: "Excellent", color: "text-green-400" } :
    percentage >= 60 ? { label: "Good", color: "text-blue-400" } :
    percentage >= 40 ? { label: "Average", color: "text-yellow-400" } :
    { label: "Needs Improvement", color: "text-red-400" };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl space-y-6">

        {/* Score card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
          <div className="size-24 rounded-full bg-emerald-500/20 flex flex-col items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-extrabold text-emerald-400">{marksObtained}</span>
            <span className="text-zinc-500 text-xs">/{totalMarks}</span>
          </div>

          <h1 className="text-2xl font-extrabold text-white mb-1">Paper Exam Result</h1>
          <p className={`text-lg font-bold ${grade.color}`}>{grade.label}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-zinc-800 rounded-xl p-3">
              <p className="text-2xl font-bold text-emerald-400">{marksObtained}</p>
              <p className="text-zinc-500 text-xs mt-0.5">Marks Scored</p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-3">
              <p className="text-2xl font-bold text-white">{totalMarks}</p>
              <p className="text-zinc-500 text-xs mt-0.5">Total Marks</p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-3">
              <p className="text-2xl font-bold text-blue-400">{percentage}%</p>
              <p className="text-zinc-500 text-xs mt-0.5">Percentage</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  percentage >= 75 ? "bg-emerald-500" :
                  percentage >= 50 ? "bg-blue-500" :
                  percentage >= 35 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-zinc-600 text-xs mt-1 text-right">{percentage}%</p>
          </div>
        </div>

        {/* Per-question breakdown */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <HiDocumentText className="text-emerald-400 size-5" />
            <h2 className="text-white font-semibold text-lg">Question-wise Breakdown</h2>
          </div>

          {feedback.map((f) => {
            const isFullMark = f.marksAwarded === f.maxMarks;
            const isZero = f.marksAwarded === 0;
            return (
              <div
                key={f.questionNumber}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3"
              >
                {/* Question header */}
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-sm font-medium">
                    Question {f.questionNumber}
                  </span>
                  <div className="flex items-center gap-2">
                    {isFullMark ? (
                      <FaCheckCircle className="text-emerald-400 size-4" />
                    ) : isZero ? (
                      <FaTimesCircle className="text-red-400 size-4" />
                    ) : (
                      <FaMinus className="text-yellow-400 size-4" />
                    )}
                    <span className={`text-sm font-bold ${
                      isFullMark ? "text-emerald-400" :
                      isZero ? "text-red-400" : "text-yellow-400"
                    }`}>
                      {f.marksAwarded} / {f.maxMarks}
                    </span>
                  </div>
                </div>

                {/* Mark bar */}
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isFullMark ? "bg-emerald-500" :
                      isZero ? "bg-red-500" : "bg-yellow-500"
                    }`}
                    style={{ width: `${(f.marksAwarded / f.maxMarks) * 100}%` }}
                  />
                </div>

                {/* Student's answer */}
                {f.studentAnswer && (
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <p className="text-zinc-500 text-[10px] uppercase tracking-wide mb-1">Your Answer</p>
                    <p className="text-zinc-300 text-xs leading-relaxed">{f.studentAnswer}</p>
                  </div>
                )}

                {/* Feedback */}
                <div className="flex items-start gap-2">
                  <span className="text-base shrink-0">💬</span>
                  <p className="text-zinc-400 text-xs leading-relaxed">{f.feedback}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <Button
            variant="outline"
            className="flex-1 border-zinc-700 text-zinc-400 hover:text-white"
            onClick={() => router.push("/quizzes")}
          >
            Back to Quizzes
          </Button>
          <Button
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
            onClick={() => router.push(`/paper-exam/${submissionId?.split("_")[0]}`)}
          >
            Try Another Paper
          </Button>
        </div>
      </div>
    </div>
  );
}