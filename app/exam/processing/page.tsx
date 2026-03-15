"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect } from "react";

const steps = [
  { label: "Answer sheet received", detail: "Your PDF has been uploaded securely" },
  { label: "Reading handwriting", detail: "Gemini Vision is scanning your answers" },
  { label: "Comparing with model answers", detail: "Checking accuracy and completeness" },
  { label: "Calculating marks", detail: "Applying marking scheme per question" },
];

function ProcessingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const submissionId = searchParams.get("id") as Id<"paperExamSubmissions"> | null;

  const status = useQuery(
    api.paperExamHelpers.getSubmissionStatus,
    submissionId ? { submissionId } : "skip"
  );

  useEffect(() => {
    if (status?.status === "graded") {
      router.push(`/paper-exam/result?id=${submissionId}`);
    }
  }, [status?.status, submissionId, router]);

  const isFailed = status?.status === "failed";
  const isGrading = status?.status === "grading" || status?.status === "submitted";

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">

        <div className="relative mx-auto size-24">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
          <div className="relative size-24 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <span className="text-4xl">🤖</span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-white mb-2">
            {isFailed ? "Grading Failed" : "AI is Grading Your Paper"}
          </h1>
          <p className="text-zinc-500 text-sm">
            {isFailed
              ? "Something went wrong. Please contact support or retry."
              : "This usually takes 1–3 minutes. You can leave this page — we'll have your results ready."}
          </p>
        </div>

        {!isFailed && (
          <div className="text-left space-y-3">
            {steps.map((step, i) => {
              const isDone = false;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className={`size-5 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-[10px] font-bold ${
                    isDone
                      ? "bg-emerald-500 text-white"
                      : i === 0
                      ? "bg-emerald-500/30 border border-emerald-500/50 text-emerald-400 animate-pulse"
                      : "bg-zinc-800 border border-zinc-700 text-zinc-600"
                  }`}>
                    {isDone ? "✓" : i + 1}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${i === 0 ? "text-white" : "text-zinc-500"}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-zinc-600">{step.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isFailed && (
          <div className="space-y-3">
            <button
              onClick={() => router.back()}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition"
            >
              Go Back & Retry
            </button>
            <button
              onClick={() => router.push("/quizzes")}
              className="w-full py-2.5 border border-zinc-700 text-zinc-400 hover:text-white rounded-xl text-sm transition"
            >
              Back to Quizzes
            </button>
          </div>
        )}

        {isGrading && (
          <p className="text-zinc-700 text-xs">
            Status: {status?.status ?? "connecting..."} · Auto-refreshing
          </p>
        )}
      </div>
    </div>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={null}>
      <ProcessingPageContent />
    </Suspense>
  );
}