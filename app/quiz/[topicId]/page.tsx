"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import {
  FaClock, FaChevronLeft, FaChevronRight,
  FaPlay, FaArrowLeft, FaFire, FaTrophy, FaBrain,
} from "react-icons/fa";
import {
  MdOutlineQuiz, MdBarChart, MdTimer,
  MdQuiz, MdBolt, MdStar,
} from "react-icons/md";

// ─── Types ────────────────────────────────────────────────────────────────────
type Question = {
  _id: Id<"questions">;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
};

type QuizState = "landing" | "loading" | "active" | "finished";

// ─── Result Screen ────────────────────────────────────────────────────────────
const ResultScreen = ({
  questions, answers, timeTaken, onRetry, topicName,
}: {
  questions: Question[];
  answers: (number | null)[];
  timeTaken: number;
  onRetry: () => void;
  topicName: string;
}) => {
  const correct = answers.filter(
    (ans, i) => ans === questions[i].correctOptionIndex
  ).length;
  const accuracy = Math.round((correct / questions.length) * 100);
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;

  const grade =
    accuracy >= 90 ? { label: "Outstanding!", emoji: "🏆", color: "text-yellow-400" } :
    accuracy >= 75 ? { label: "Excellent!", emoji: "🌟", color: "text-green-400" } :
    accuracy >= 60 ? { label: "Good Job!", emoji: "👍", color: "text-blue-400" } :
    accuracy >= 40 ? { label: "Keep Going!", emoji: "📚", color: "text-orange-400" } :
    { label: "Keep Practicing!", emoji: "💪", color: "text-red-400" };

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Result Hero */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center space-y-3">
          <div className="text-7xl">{grade.emoji}</div>
          <h1 className={`text-3xl font-bold ${grade.color}`}>{grade.label}</h1>
          <p className="text-zinc-400">{topicName}</p>
          <div className="mt-4 inline-flex items-center justify-center w-28 h-28 rounded-full border-4 border-[#FF8D28] bg-[#FF8D28]/10">
            <div>
              <p className="text-3xl font-bold text-white">{accuracy}%</p>
              <p className="text-xs text-zinc-400">accuracy</p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "✅", label: "Correct", value: `${correct}/${questions.length}` },
            { icon: "⚡", label: "Accuracy", value: `${accuracy}%` },
            { icon: "⏱️", label: "Time", value: `${minutes}m ${seconds}s` },
          ].map((stat) => (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Review */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-3">
          <h2 className="text-white font-semibold text-lg">Answer Review</h2>
          {questions.map((q, i) => {
            const isCorrect = answers[i] === q.correctOptionIndex;
            return (
              <div key={q._id} className={`rounded-xl p-4 border ${
                isCorrect ? "border-green-700/40 bg-green-950/20" : "border-red-700/40 bg-red-950/20"
              }`}>
                <div className="flex items-start gap-2">
                  <span className={`text-lg shrink-0 mt-0.5 ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                    {isCorrect ? "✓" : "✗"}
                  </span>
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="text-white text-sm font-medium leading-relaxed">
                      Q{i + 1}. {q.questionText}
                    </p>
                    <p className="text-zinc-400 text-xs">
                      Your answer:{" "}
                      <span className={isCorrect ? "text-green-400" : "text-red-400"}>
                        {answers[i] !== null ? q.options[answers[i]!] : "Not answered"}
                      </span>
                    </p>
                    {!isCorrect && (
                      <p className="text-zinc-400 text-xs">
                        Correct: <span className="text-green-400">{q.options[q.correctOptionIndex]}</span>
                      </p>
                    )}
                    {q.explanation && (
                      <p className="text-zinc-600 text-xs mt-1.5 italic border-t border-zinc-800 pt-1.5">
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={onRetry} className="flex-1 bg-[#FF8D28] hover:bg-[#ff8d28d9] text-white py-6 text-base">
            🔄 Try Again
          </Button>
          <Button asChild variant="outline" className="flex-1 py-6 text-base">
            <Link href="/">🏠 Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Quiz Page ───────────────────────────────────────────────────────────
const QuizPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();

  const topicId = params.topicId as Id<"topics">;

  const [quizState, setQuizState] = useState<QuizState>("landing");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const [timeTaken, setTimeTaken] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [isGenerating, setIsGenerating] = useState(false);

  // ── Convex queries ──
  const dbUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");
  const profile = useQuery(api.userProfiles.getProfileByUserId, dbUser ? { userId: dbUser._id } : "skip");
  const topic = useQuery(api.questions.getTopicWithExam, { topicId });
  const existingQuestions = useQuery(api.questions.getQuestionsByTopic, { topicId });
  const cardDetail = useQuery(api.cards.getCardDetail, { topicId });
  const incrementViewCount = useMutation(api.cards.incrementViewCount);

  const generateQuestions = useAction(api.ai.generateQuestions.generateAndStoreQuestions);
  const saveQuizResult = useAction(api.attempts.saveQuizResult);

  // ── Increment view count on load ──
  useEffect(() => {
    incrementViewCount({ topicId });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  // ── Save Result ──
  const handleSaveResult = useCallback(async (
    finalAnswers: (number | null)[],
    takenSeconds: number,
  ) => {
    if (!dbUser || !topic) return;
    try {
      const correct = finalAnswers.filter(
        (ans, i) => ans === questions[i].correctOptionIndex
      ).length;
      const accuracy = Math.round((correct / questions.length) * 100);
      const answerDetails = questions.map((q, i) => ({
        questionId: q._id,
        selectedOptionIndex: finalAnswers[i] ?? 0,
        isCorrect: finalAnswers[i] === q.correctOptionIndex,
        timeSpentSeconds: Math.floor(takenSeconds / questions.length),
      }));
      await saveQuizResult({
        userId: dbUser._id,
        examId: topic.examId,
        topicId,
        score: correct,
        accuracy,
        timeTakenSeconds: takenSeconds,
        startedAt: startTime,
        completedAt: Date.now(),
        answers: answerDetails,
      });
    } catch (error) {
      console.error("Failed to save result:", error);
    }
  }, [dbUser, topic, questions, saveQuizResult, topicId, startTime]);

  // ── Timer ──
  useEffect(() => {
    if (quizState !== "active") return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          const taken = Math.floor((Date.now() - startTime) / 1000);
          setTimeTaken(taken);
          setQuizState("finished");
          handleSaveResult(answers, taken);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quizState, startTime, handleSaveResult, answers]);

  // ── Start Quiz Handler ──
  const handleStartQuiz = async () => {
    if (existingQuestions && existingQuestions.length >= 5) {
      const sliced = existingQuestions.slice(0, 10) as Question[];
      setQuestions(sliced);
      setAnswers(new Array(sliced.length).fill(null));
      setQuizState("active");
      return;
    }
    setIsGenerating(true);
    setQuizState("loading");
    try {
      toast.loading("Generating your personalized questions...");
      await generateQuestions({
        examId: topic!.examId,
        subjectId: topic!.subjectId,
        topicId,
        examName: profile?.targetExam ?? "General",
        subjectName: "General",
        topicName: topic!.name,
        difficulty: "medium",
        count: 10,
      });
      toast.dismiss();
      toast.success("Questions ready!");
    } catch {
      toast.dismiss();
      toast.error("Failed to generate questions.");
      setQuizState("landing");
      setIsGenerating(false);
    }
  };

  // ── Watch for questions after generation ──
  useEffect(() => {
    if (quizState !== "loading") return;
    if (!existingQuestions || existingQuestions.length < 5) return;
    const sliced = existingQuestions.slice(0, 10) as Question[];
    setQuestions(sliced);
    setAnswers(new Array(sliced.length).fill(null));
    setIsGenerating(false);
    setQuizState("active");
  }, [existingQuestions, quizState]);

  // ── Quiz Handlers ──
  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    const updated = [...answers];
    updated[currentIndex] = index;
    setAnswers(updated);
  };

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(answers[currentIndex + 1]);
    } else {
      const taken = Math.floor((Date.now() - startTime) / 1000);
      setTimeTaken(taken);
      setQuizState("finished");
      handleSaveResult(answers, taken);
    }
  }, [currentIndex, questions.length, answers, startTime, handleSaveResult]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setSelectedOption(answers[currentIndex - 1]);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setAnswers(new Array(questions.length).fill(null));
    setSelectedOption(null);
    setTimeLeft(600);
    setQuizState("landing");
  };

  // ── Derived ──
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = answers.filter((a) => a !== null).length;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const card = cardDetail as {
    name?: string;
    description?: string;
    imageUrl?: string;
    difficultyWeight?: number;
    category?: string;
    parentName?: string;
    viewCount?: number;
  } | null | undefined;

  // ── Render: Finished ──
  if (quizState === "finished") {
    return (
      <ResultScreen
        questions={questions}
        answers={answers}
        timeTaken={timeTaken}
        onRetry={handleRetry}
        topicName={topic?.name ?? "Quiz"}
      />
    );
  }

  // ── Render: Active Quiz ──
  if (quizState === "active") {
    return (
      <div className="min-h-screen bg-zinc-950 px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuizState("landing")}
                className="text-zinc-400 hover:text-white transition p-2 hover:bg-zinc-800 rounded-lg"
              >
                <FaArrowLeft className="size-4" />
              </button>
              <div>
                <p className="text-white font-semibold text-sm">{topic?.name}</p>
                <p className="text-zinc-500 text-xs">
                  Question {currentIndex + 1} of {questions.length}
                </p>
              </div>
            </div>

            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${
              timeLeft < 60
                ? "bg-red-950 text-red-400 border border-red-800 animate-pulse"
                : timeLeft < 120
                ? "bg-orange-950 text-orange-400 border border-orange-800"
                : "bg-zinc-800 text-white border border-zinc-700"
            }`}>
              <FaClock className="size-4" />
              {minutes}:{seconds.toString().padStart(2, "0")}
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>{answeredCount} answered</span>
              <span>{questions.length - answeredCount} remaining</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-linear-to-r from-[#FF8D28] to-orange-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex gap-1 mt-1">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1 rounded-full transition-all ${
                    i === currentIndex ? "bg-[#FF8D28]" :
                    answers[i] !== null ? "bg-green-600" : "bg-zinc-700"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Question Card */}
          <Card className="bg-zinc-900 border-zinc-800 rounded-2xl overflow-hidden">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2">
                <span className="bg-[#FF8D28]/20 text-[#FF8D28] text-xs font-bold px-3 py-1 rounded-full border border-[#FF8D28]/30">
                  Q{currentIndex + 1}
                </span>
                {currentQuestion?.difficulty && (
                  <span className={`text-xs px-2 py-1 rounded-full border capitalize ${
                    currentQuestion.difficulty === "easy"
                      ? "text-green-400 bg-green-900/20 border-green-700/30"
                      : currentQuestion.difficulty === "hard"
                      ? "text-red-400 bg-red-900/20 border-red-700/30"
                      : "text-yellow-400 bg-yellow-900/20 border-yellow-700/30"
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                )}
              </div>

              <p className="text-white text-lg font-medium leading-relaxed">
                {currentQuestion?.questionText}
              </p>

              <div className="space-y-2.5">
                {currentQuestion?.options.map((option, index) => {
                  const isSelected = selectedOption === index;

                  // ✅ No answer reveal during quiz — only highlight selected
                  const optionClass = selectedOption === null
                    ? "border-zinc-700 text-zinc-300 hover:border-[#FF8D28]/60 hover:bg-zinc-800/50 hover:text-white cursor-pointer"
                    : isSelected
                    ? "border-[#FF8D28] bg-[#FF8D28]/10 text-white cursor-default"
                    : "border-zinc-700 text-zinc-400 cursor-not-allowed opacity-50";

                  return (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(index)}
                      disabled={selectedOption !== null}
                      className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm transition-all duration-200 flex items-center gap-3 ${optionClass}`}
                    >
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border transition-all ${
                        isSelected
                          ? "bg-[#FF8D28] border-[#FF8D28] text-white"
                          : "border-zinc-600 text-zinc-400"
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>

              {/* ✅ Engaging bottom panel instead of answer reveal */}
              <div className="mt-1 pt-4 border-t border-zinc-800/60 space-y-3">
                {/* Progress mini stats */}
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#FF8D28]" />
                      {answeredCount} answered
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-zinc-600" />
                      {questions.length - answeredCount} left
                    </span>
                  </div>
                  <span className={selectedOption !== null ? "text-[#FF8D28] font-medium" : "text-zinc-600"}>
                    {selectedOption !== null ? "✓ Locked in" : "Choose wisely..."}
                  </span>
                </div>

                {/* Motivational nudge after answering */}
                {selectedOption !== null ? (
                  <div className="bg-zinc-800/60 border border-zinc-700/40 rounded-xl px-4 py-3 flex items-center gap-3">
                    <span className="text-2xl shrink-0">
                      {currentIndex === questions.length - 1 ? "🏁" : currentIndex >= questions.length * 0.75 ? "🔥" : currentIndex >= questions.length * 0.5 ? "⚡" : "👉"}
                    </span>
                    <div>
                      <p className="text-white text-xs font-medium">
                        {currentIndex === questions.length - 1
                          ? "Last one! Hit Finish to see your results."
                          : currentIndex >= questions.length * 0.75
                          ? "Almost there! Keep the momentum going!"
                          : currentIndex >= questions.length * 0.5
                          ? "Halfway done — you're on a roll!"
                          : "Good pick! Move to the next question."}
                      </p>
                      <p className="text-zinc-500 text-xs mt-0.5">
                        Results + explanations revealed at the end
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-800/30 border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3">
                    <span className="text-xl shrink-0">🤔</span>
                    <p className="text-zinc-500 text-xs">
                      Take your time — explanations for every question revealed after you finish!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <Button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              variant="outline"
              className="flex items-center gap-2 px-6"
            >
              <FaChevronLeft className="size-3" /> Prev
            </Button>
            <p className="text-zinc-500 text-sm">{currentIndex + 1} / {questions.length}</p>
            <Button
              onClick={handleNext}
              disabled={selectedOption === null}
              className="flex items-center gap-2 px-6 bg-[#FF8D28] hover:bg-[#ff8d28d9] text-white"
            >
              {currentIndex === questions.length - 1
                ? <><FaTrophy className="size-3" /> Finish</>
                : <>Next <FaChevronRight className="size-3" /></>
              }
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Loading ──
  if (quizState === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 gap-5">
        <div className="relative">
          <FaBrain className="text-[#FF8D28] size-16 animate-pulse" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF8D28] rounded-full animate-ping" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-white text-xl font-bold">AI is thinking...</p>
          <p className="text-zinc-400 text-sm">Crafting personalized questions for you</p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#FF8D28] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Render: Landing ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950">

      {/* Hero Image */}
      <div className="relative w-full h-72 md:h-96 overflow-hidden">
        {card?.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt={card.name ?? "Quiz"}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-orange-900 via-orange-950 to-zinc-900 flex items-center justify-center">
            <MdQuiz className="text-white/10 size-32" />
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
            <MdBolt className="size-3 text-yellow-400" />
            AI Generated
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full mx-auto px-10 -mt-20 pb-20 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Left */}
          <div className="flex-1 space-y-5">
            {card?.parentName && (
              <p className="text-[#FF8D28] text-sm font-medium tracking-wide uppercase">
                {card.parentName}
              </p>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              {card?.name ?? topic?.name ?? "Quiz"}
            </h1>

            <p className="text-zinc-400 leading-relaxed">
              {card?.description ??
                `Master ${card?.name ?? topic?.name} with AI-generated questions tailored to your level.`}
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: <MdBolt className="size-3.5" />, label: "Instant Results" },
                { icon: <FaBrain className="size-3" />, label: "AI Questions" },
                { icon: <MdStar className="size-3.5" />, label: "Track Progress" },
                { icon: <FaFire className="size-3" />, label: "Build Streaks" },
              ].map((pill) => (
                <div key={pill.label} className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs px-3 py-1.5 rounded-full">
                  <span className="text-[#FF8D28]">{pill.icon}</span>
                  {pill.label}
                </div>
              ))}
            </div>

            <Button
              onClick={handleStartQuiz}
              disabled={isGenerating || !topic}
              className="bg-[#FF8D28] hover:bg-[#ff8d28d9] text-white px-10 py-7 text-lg font-bold rounded-2xl gap-3 w-full sm:w-auto shadow-lg shadow-[#FF8D28]/20 hover:shadow-[#FF8D28]/40 transition-all duration-300 hover:scale-[1.02]"
            >
              <FaPlay className="size-4" />
              {existingQuestions && existingQuestions.length >= 5
                ? "Start Quiz Now"
                : "Generate & Start Quiz"}
            </Button>

            <p className="text-zinc-600 text-xs">
              ⚡ Takes less than 10 minutes • Auto-saved to your profile
            </p>
          </div>

          {/* Right */}
          <div className="w-full lg:w-80 shrink-0 space-y-4">

            {/* Quiz Details */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="bg-linear-to-r from-[#FF8D28]/20 to-transparent border-b border-zinc-800 px-5 py-4">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <MdOutlineQuiz className="text-[#FF8D28] size-5" />
                  Quiz Details
                </h3>
              </div>
              <div className="divide-y divide-zinc-800/60">
                {[
                  {
                    icon: <MdQuiz className="size-4 text-[#FF8D28]" />,
                    label: "Questions",
                    value: existingQuestions && existingQuestions.length >= 5
                      ? `${Math.min(existingQuestions.length, 10)} MCQs`
                      : "10 MCQs",
                  },
                  {
                    icon: <MdTimer className="size-4 text-blue-400" />,
                    label: "Time Limit",
                    value: "10 minutes",
                  },
                  {
                    icon: <MdBarChart className="size-4 text-yellow-400" />,
                    label: "Difficulty",
                    value: card?.difficultyWeight ? `${card.difficultyWeight}/10` : "Medium",
                  },
                  {
                    icon: <span className="text-sm">👁</span>,
                    label: "Attempts",
                    value: `${card?.viewCount ?? 0} students`,
                  },
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
                  💡 Answers explained after each question. Score saved automatically.
                </p>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">You can earn</p>
              <div className="space-y-2">
                {[
                  { icon: "🥇", label: "Score 90%+", reward: "Gold Badge" },
                  { icon: "🔥", label: "Complete today", reward: "Streak +1" },
                  { icon: "⚡", label: "Finish in 5 min", reward: "Speed Star" },
                ].map((a) => (
                  <div key={a.label} className="flex items-center gap-3 bg-zinc-800/50 rounded-xl px-3 py-2.5">
                    <span className="text-xl">{a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium">{a.label}</p>
                      <p className="text-zinc-500 text-xs">{a.reward}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;