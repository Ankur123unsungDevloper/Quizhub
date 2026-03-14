/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FaClock, FaFilePdf, FaCheckCircle, FaUpload, FaExclamationTriangle, FaArrowLeft } from "react-icons/fa";
import { HiDocumentText } from "react-icons/hi";
import { MdSchool } from "react-icons/md";

// ─── Constants ────────────────────────────────────────────────────────────────
const EXAM_DURATION_SECONDS = 3 * 60 * 60; // 3 hours
const UPLOAD_UNLOCK_SECONDS = 60 * 60;      // upload unlocks after 1 hour
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

type PaperQuestion = {
  questionNumber: number;
  questionText: string;
  marks: number;
  modelAnswer: string;
  type: "short" | "long" | "numerical" | "diagram";
};

type PageState = "landing" | "generating" | "active" | "uploading" | "submitted";

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

// ─── Question Card ────────────────────────────────────────────────────────────
const QuestionCard = ({ q, index }: { q: PaperQuestion; index: number }) => (
  <div className="flex gap-4 py-4 border-b border-zinc-800 last:border-0">
    <div className="shrink-0 flex flex-col items-center gap-1">
      <span className="size-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">
        {q.questionNumber}
      </span>
      <span className="text-[10px] text-zinc-600 font-medium">{q.marks}m</span>
    </div>
    <div className="flex-1">
      <p className="text-zinc-200 text-sm leading-relaxed">{q.questionText}</p>
      <span className={`mt-2 inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${
        q.type === "short" ? "bg-blue-500/20 text-blue-400" :
        q.type === "long" ? "bg-purple-500/20 text-purple-400" :
        q.type === "numerical" ? "bg-green-500/20 text-green-400" :
        "bg-yellow-500/20 text-yellow-400"
      }`}>
        {q.type === "short" ? "Short Answer" :
         q.type === "long" ? "Long Answer" :
         q.type === "numerical" ? "Numerical" : "Diagram"}
      </span>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PaperExamPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const router = useRouter();
  const { user } = useUser();

  const topic = useQuery(api.admin.getTopicWithExam, {
    topicId: topicId as Id<"topics">,
  });
  const dbUser = useQuery(api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );
  const allExams = useQuery(api.admin.getAllExams);

  const generatePaper = useAction(api.paperExams.generateQuestionPaper);
  const saveSubmission = useMutation(api.paperExamHelpers.saveSubmission);
  const triggerGrading = useAction(api.paperExams.triggerGrading);

  // ── State ──
  const [pageState, setPageState] = useState<PageState>("landing");
  const [questions, setQuestions] = useState<PaperQuestion[]>([]);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SECONDS);
  const [startedAt, setStartedAt] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generationError, setGenerationError] = useState("");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadUnlocked = timeLeft <= EXAM_DURATION_SECONDS - UPLOAD_UNLOCK_SECONDS;
  const isTimeLow = timeLeft < 15 * 60; // last 15 mins
  const totalMarks = questions.reduce((s, q) => s + q.marks, 0);

  const examName = allExams?.find((e: { _id: Id<"exams">; name: string }) =>
    e._id === topic?.examId
  )?.name ?? "Exam";

  // ── Timer ──
  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (pageState !== "active") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => stopTimer();
  }, [pageState, stopTimer]);

  // ── Generate paper ──
  const handleStartExam = async () => {
    if (!topic) return;
    setPageState("generating");
    setGenerationError("");
    try {
      const paper = await generatePaper({
        topicId: topicId as Id<"topics">,
        examType: examName,
        subject: topic.name,
        topicName: topic.name,
        totalMarks: 40,
        durationMinutes: 180,
      });
      setQuestions(paper);
      setStartedAt(Date.now());
      setPageState("active");
    } catch (e) {
      setGenerationError("Failed to generate paper. Please try again.");
      setPageState("landing");
    }
  };

  // ── File selection ──
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError("");
    if (!file) return;
    if (file.type !== "application/pdf") {
      setFileError("Only PDF files are allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    setSelectedFile(file);
  };

  // ── Upload to Cloudinary + submit ──
  const handleSubmit = async () => {
    if (!selectedFile || !dbUser || !topic) return;
    setPageState("uploading");
    stopTimer();

    try {
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("upload_preset", "quizhub_papers");
      formData.append("resource_type", "raw");

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload`,
        { method: "POST", body: formData }
      );
      const cloudData = await cloudRes.json();
      const fileUrl: string = cloudData.secure_url;

      // Save submission to Convex
      const submissionId = await saveSubmission({
        userId: dbUser._id,
        topicId: topicId as Id<"topics">,
        examId: topic.examId as Id<"exams">,
        questionPaper: questions,
        totalMarks,
        fileUrl,
        timeTakenSeconds: EXAM_DURATION_SECONDS - timeLeft,
      });

      // Trigger Gemini grading (runs in background)
      triggerGrading({ submissionId }).catch(console.error);

      // Redirect to processing page
      router.push(`/paper-exam/processing?id=${submissionId}`);
    } catch (e) {
      console.error("Submission failed:", e);
      setFileError("Upload failed. Please try again.");
      setPageState("active");
    }
  };

  // ─────────────────────── LANDING ─────────────────────────────────────────
  if (pageState === "landing" || pageState === "generating") {
    return (
      <div className="min-h-screen bg-zinc-950">

        {/* Hero Image */}
        <div className="relative w-full h-72 md:h-96 overflow-hidden">
          {topic?.imageUrl ? (
            <Image
              src={topic.imageUrl}
              alt={topic.name ?? "Paper Exam"}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-emerald-900 via-emerald-950 to-zinc-900 flex items-center justify-center">
              <HiDocumentText className="text-white/10 size-32" />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/50 to-black/20" />

          <button
            onClick={() => router.back()}
            className="absolute top-5 left-5 flex items-center gap-2 bg-black/40 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm hover:bg-black/60 transition"
          >
            <FaArrowLeft className="size-3" /> Back
          </button>

          <div className="absolute top-5 right-5">
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
              <MdSchool className="size-3 text-emerald-400" />
              Physical Exam
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="w-full mx-auto px-10 -mt-20 pb-20 relative z-10">
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* Left */}
            <div className="flex-1 space-y-5">
              <p className="text-emerald-400 text-sm font-medium tracking-wide uppercase">
                {examName}
              </p>

              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                {topic?.name ?? "Loading..."}
              </h1>

              <p className="text-zinc-400 leading-relaxed">
                AI generates a fresh question paper based on the {examName} pattern.
                Solve it physically on paper, scan and upload as PDF — Gemini AI will grade it for you.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: <HiDocumentText className="size-3.5" />, label: "Fresh Paper Each Time" },
                  { icon: <MdSchool className="size-3.5" />, label: "Real Exam Pattern" },
                  { icon: <FaUpload className="size-3" />, label: "PDF Upload" },
                  { icon: <span className="text-xs">🤖</span>, label: "AI Grading" },
                ].map((pill) => (
                  <div key={pill.label} className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs px-3 py-1.5 rounded-full">
                    <span className="text-emerald-400">{pill.icon}</span>
                    {pill.label}
                  </div>
                ))}
              </div>

              {generationError && (
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <FaExclamationTriangle className="size-3.5" /> {generationError}
                </p>
              )}

              <Button
                onClick={handleStartExam}
                disabled={pageState === "generating" || !topic}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-7 text-lg font-bold rounded-2xl gap-3 w-full sm:w-auto shadow-lg shadow-emerald-900/40 hover:shadow-emerald-700/40 transition-all duration-300 hover:scale-[1.02]"
              >
                {pageState === "generating" ? (
                  <>
                    <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating Paper...
                  </>
                ) : (
                  <>
                    <HiDocumentText className="size-5" />
                    Generate & Start Exam
                  </>
                )}
              </Button>

              <p className="text-zinc-600 text-xs">
                ⏱ 3 hours to solve · PDF upload unlocks after 1 hour · Results in minutes
              </p>
            </div>

            {/* Right */}
            <div className="w-full lg:w-80 shrink-0 space-y-4">

              {/* Exam Details */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="bg-linear-to-r from-emerald-500/20 to-transparent border-b border-zinc-800 px-5 py-4">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <HiDocumentText className="text-emerald-400 size-5" />
                    Exam Details
                  </h3>
                </div>
                <div className="divide-y divide-zinc-800/60">
                  {[
                    { icon: <MdSchool className="size-4 text-emerald-400" />, label: "Pattern", value: examName },
                    { icon: <FaClock className="size-4 text-blue-400" />, label: "Duration", value: "3 Hours" },
                    { icon: <span className="text-sm">📝</span>, label: "Total Marks", value: "40 Marks" },
                    { icon: <FaFilePdf className="size-4 text-red-400" />, label: "Upload Format", value: "PDF only" },
                    { icon: <span className="text-sm">🔓</span>, label: "Upload Unlocks", value: "After 1 hour" },
                    { icon: <span className="text-sm">🤖</span>, label: "Graded by", value: "Gemini AI" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 px-5 py-3.5">
                      <div className="shrink-0">{item.icon}</div>
                      <span className="text-zinc-400 text-sm flex-1">{item.label}</span>
                      <span className="text-white text-sm font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-4 bg-zinc-800/30">
                  <p className="text-zinc-500 text-xs leading-relaxed">
                    💡 Scan your answer sheet clearly. Results include per-question marks breakdown.
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
                <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">How it works</p>
                <div className="space-y-2">
                  {[
                    { step: "1", text: "AI generates a fresh question paper" },
                    { step: "2", text: "Solve it on paper within 3 hours" },
                    { step: "3", text: "Scan & upload as PDF after 1 hour" },
                    { step: "4", text: "Gemini reads & grades your answers" },
                  ].map((s) => (
                    <div key={s.step} className="flex items-center gap-3 bg-zinc-800/50 rounded-xl px-3 py-2.5">
                      <span className="size-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
                        {s.step}
                      </span>
                      <p className="text-zinc-300 text-xs">{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────── UPLOADING ───────────────────────────────────────
  if (pageState === "uploading") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="size-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
            <FaUpload className="size-7 text-emerald-400 animate-bounce" />
          </div>
          <h2 className="text-white font-bold text-xl">Uploading your answer sheet...</h2>
          <p className="text-zinc-500 text-sm">Please don&apos;t close this tab</p>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full animate-pulse w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────── ACTIVE EXAM ─────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">

      {/* Sticky top bar */}
      <div className="sticky top-0 z-50 bg-zinc-900 border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MdSchool className="text-emerald-400 size-5" />
          <span className="text-white font-semibold text-sm line-clamp-1 max-w-xs">
            {topic?.name}
          </span>
          <span className="text-zinc-600 text-xs hidden sm:block">
            {examName} · {totalMarks} marks
          </span>
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-bold text-sm ${
          timeLeft === 0
            ? "bg-red-500/30 text-red-300"
            : isTimeLow
            ? "bg-red-500/20 text-red-400 animate-pulse"
            : "bg-zinc-800 text-white"
        }`}>
          <FaClock className="size-3.5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Paper header */}
        <div className="text-center border-b border-zinc-800 pb-6">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">{examName}</p>
          <h1 className="text-2xl font-extrabold text-white">{topic?.name}</h1>
          <div className="flex items-center justify-center gap-6 mt-3 text-sm text-zinc-400">
            <span>Total Marks: <strong className="text-white">{totalMarks}</strong></span>
            <span>Time: <strong className="text-white">3 Hours</strong></span>
            <span>Questions: <strong className="text-white">{questions.length}</strong></span>
          </div>
          <p className="text-zinc-600 text-xs mt-3 italic">
            Read all questions carefully. Attempt all questions.
          </p>
        </div>

        {/* Questions */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6 divide-y divide-zinc-800">
            {questions.map((q, i) => (
              <QuestionCard key={q.questionNumber} q={q} index={i} />
            ))}
          </CardContent>
        </Card>

        {/* Upload section */}
        <Card className={`border transition-all duration-500 ${
          uploadUnlocked
            ? "bg-zinc-900 border-emerald-800/50"
            : "bg-zinc-900/50 border-zinc-800 opacity-60"
        }`}>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaFilePdf className={`size-5 ${uploadUnlocked ? "text-emerald-400" : "text-zinc-600"}`} />
                <h3 className={`font-semibold text-sm ${uploadUnlocked ? "text-white" : "text-zinc-500"}`}>
                  Upload Answer Sheet
                </h3>
              </div>
              {!uploadUnlocked && (
                <span className="text-xs text-zinc-500 flex items-center gap-1.5">
                  <FaClock className="size-3" />
                  Unlocks after 1 hour
                </span>
              )}
              {uploadUnlocked && !selectedFile && (
                <span className="text-xs text-emerald-400 font-medium">Upload now available</span>
              )}
            </div>

            {uploadUnlocked && (
              <>
                <p className="text-zinc-500 text-xs">
                  Scan or photograph your answer sheet and save as PDF. Maximum size: {MAX_FILE_SIZE_MB}MB.
                </p>

                {/* Drop zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                    selectedFile
                      ? "border-emerald-500/50 bg-emerald-500/5"
                      : "border-zinc-700 hover:border-emerald-600/50 hover:bg-zinc-800/50"
                  }`}
                >
                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <FaCheckCircle className="size-8 text-emerald-400" />
                      <p className="text-white text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-zinc-500 text-xs">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · PDF
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                        className="text-zinc-500 text-xs hover:text-red-400 underline mt-1"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <FaUpload className="size-7 text-zinc-600" />
                      <p className="text-zinc-400 text-sm">Click to select PDF</p>
                      <p className="text-zinc-600 text-xs">PDF only · Max {MAX_FILE_SIZE_MB}MB</p>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {fileError && (
                  <p className="text-red-400 text-xs flex items-center gap-1.5">
                    <FaExclamationTriangle className="size-3" /> {fileError}
                  </p>
                )}

                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                  disabled={!selectedFile}
                  onClick={handleSubmit}
                >
                  Submit Answer Sheet
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-zinc-700 text-xs pb-8">
          After submission, Gemini AI will grade your answers. You&apos;ll be redirected to a waiting page.
        </p>
      </div>
    </div>
  );
}