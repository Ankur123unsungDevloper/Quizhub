"use client";

import {
  useEffect,
  useState,
  useCallback
} from "react";
import {
  useParams,
  useRouter
} from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  useQuery,
  useAction
} from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  FaClock,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import { MdOutlineQuiz } from "react-icons/md";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
type Question = {
  _id: Id<"questions">;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
};

type QuizState = "loading" | "ready" | "active" | "finished";

// ─── Result Screen ────────────────────────────────────────────────────────────
const ResultScreen = ({
  questions,
  answers,
  timeTaken,
  onRetry,
}: {
  questions: Question[];
  answers: (number | null)[];
  timeTaken: number;
  onRetry: () => void;
}) => {
  const correct = answers.filter(
    (ans, i) => ans === questions[i].correctOptionIndex
  ).length;

  const accuracy = Math.round((correct / questions.length) * 100);
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">

        {/* Score Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Quiz Complete! 🎉</h1>
          <p className="text-zinc-400">Here&apos;s how you did</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-zinc-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#FF8D28]">
              {correct}/{questions.length}
            </p>
            <p className="text-zinc-400 text-sm mt-1">Score</p>
          </div>
          <div className="bg-zinc-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#FF8D28]">{accuracy}%</p>
            <p className="text-zinc-400 text-sm mt-1">Accuracy</p>
          </div>
          <div className="bg-zinc-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#FF8D28]">
              {minutes}m {seconds}s
            </p>
            <p className="text-zinc-400 text-sm mt-1">Time Taken</p>
          </div>
        </div>

        {/* Question Review */}
        <div className="space-y-4">
          <h2 className="text-white font-semibold text-lg">Review</h2>
          {questions.map((q, i) => {
            const isCorrect = answers[i] === q.correctOptionIndex;
            return (
              <div
                key={q._id}
                className={`rounded-xl p-4 border ${
                  isCorrect
                    ? "border-green-600 bg-green-950/30"
                    : "border-red-600 bg-red-950/30"
                }`}
              >
                <p className="text-white text-sm font-medium">
                  Q{i + 1}. {q.questionText}
                </p>
                <p className="text-zinc-400 text-xs mt-2">
                  Your answer:{" "}
                  <span
                    className={isCorrect ? "text-green-400" : "text-red-400"}
                  >
                    {answers[i] !== null
                      ? q.options[answers[i]!]
                      : "Not answered"}
                  </span>
                </p>
                {!isCorrect && (
                  <p className="text-zinc-400 text-xs mt-1">
                    Correct:{" "}
                    <span className="text-green-400">
                      {q.options[q.correctOptionIndex]}
                    </span>
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={onRetry}
            className="flex-1 bg-[#FF8D28] hover:bg-[#ff8d28d9] text-white"
          >
            Try Again
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/">Back to Home</Link>
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

  // ── State ──
  const [quizState, setQuizState] = useState<QuizState>("loading");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const [timeTaken, setTimeTaken] = useState(0);
  const [startTime] = useState(() => Date.now());

  // ── Convex ──
  const dbUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const profile = useQuery(
    api.userProfiles.getProfileByUserId,
    dbUser ? { userId: dbUser._id } : "skip"
  );

  const topic = useQuery(
    api.questions.getTopicWithExam,
    { topicId }
  );

  const existingQuestions = useQuery(
    api.questions.getQuestionsByTopic,
    { topicId }
  );

  const generateQuestions = useAction(
    api.ai.generateQuestions.generateAndStoreQuestions
  );

  const saveQuizResult = useAction(api.attempts.saveQuizResult);

  // ── Save Result Handler ──
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
        testId: topic.examId as unknown as Id<"tests">,
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
      // Fail silently — don't interrupt user experience
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

          // ✅ Auto save when timer runs out
          handleSaveResult(answers, taken);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState, startTime, handleSaveResult, answers]);

  // ── Load or Generate Questions ──
  useEffect(() => {
    if (existingQuestions === undefined || !topic || !profile) return;
    if (quizState !== "loading") return;

    const setup = async () => {
      if (existingQuestions.length >= 5) {
        const sliced = existingQuestions.slice(0, 10) as Question[];
        setTimeout(() => {
          setQuestions(sliced);
          setAnswers(new Array(sliced.length).fill(null));
          setQuizState("ready");
        }, 0);
        return;
      }

      try {
        toast.loading("Generating your personalized questions...");

        await generateQuestions({
          examId: topic.examId,
          subjectId: topic.subjectId,
          topicId,
          examName: profile.targetExam ?? "General",
          subjectName: "General",
          topicName: topic.name,
          difficulty: "medium",
          count: 10,
        });

        toast.dismiss();
        toast.success("Questions ready!");

      } catch {
        toast.dismiss();
        toast.error("Failed to generate questions. Please try again.");
        router.push("/");
      }
    };

    setup();
  }, [
    existingQuestions,
    topic,
    profile,
    quizState,
    generateQuestions,
    router,
    topicId,
  ]);

  // ── Watch for questions after AI generation ──
  useEffect(() => {
    if (quizState !== "loading") return;
    if (!existingQuestions || existingQuestions.length < 5) return;

    const sliced = existingQuestions.slice(0, 10) as Question[];
    setTimeout(() => {
      setQuestions(sliced);
      setAnswers(new Array(sliced.length).fill(null));
      setQuizState("ready");
    }, 0);
  }, [existingQuestions, quizState]);

  // ── Handlers ──
  const handleStart = () => {
    setQuizState("active");
  };

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
      // ✅ Last question — finish and auto save
      const taken = Math.floor((Date.now() - startTime) / 1000);
      setTimeTaken(taken);
      setQuizState("finished");
      handleSaveResult(answers, taken);
    }
  }, [
    currentIndex,
    questions.length,
    answers,
    startTime,
    handleSaveResult,
  ]);

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
    setQuizState("ready");
  };

  // ── Derived ──
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // ── Render: Loading ──
  if (quizState === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 gap-4">
        <MdOutlineQuiz className="text-[#FF8D28] size-12 animate-pulse" />
        <p className="text-white text-lg font-semibold">
          Preparing your quiz...
        </p>
        <p className="text-zinc-400 text-sm">
          AI is generating personalized questions for you
        </p>
      </div>
    );
  }

  // ── Render: Ready ──
  if (quizState === "ready") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-6">
          <MdOutlineQuiz className="text-[#FF8D28] size-12 mx-auto" />
          <h1 className="text-2xl font-bold text-white">
            {topic?.name ?? "Quiz"}
          </h1>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-zinc-800 rounded-xl p-3">
              <p className="text-[#FF8D28] font-bold text-lg">
                {questions.length}
              </p>
              <p className="text-zinc-400">Questions</p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-3">
              <p className="text-[#FF8D28] font-bold text-lg">10 min</p>
              <p className="text-zinc-400">Time Limit</p>
            </div>
          </div>
          <Button
            onClick={handleStart}
            className="w-full bg-[#FF8D28] hover:bg-[#ff8d28d9] text-white"
          >
            Start Quiz
          </Button>
        </div>
      </div>
    );
  }

  // ── Render: Finished ──
  if (quizState === "finished") {
    return (
      <ResultScreen
        questions={questions}
        answers={answers}
        timeTaken={timeTaken}
        onRetry={handleRetry}
      />
    );
  }

  // ── Render: Active Quiz ──
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4 py-8">
      <div className="w-full max-w-2xl space-y-6">

        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <span className="text-zinc-400 text-sm font-medium">
            Q{currentIndex + 1}/{questions.length}
          </span>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold
            ${timeLeft < 60
              ? "bg-red-950 text-red-400 border border-red-800"
              : "bg-zinc-800 text-white"
            }`}
          >
            <FaClock className="size-4" />
            {minutes}:{seconds.toString().padStart(2, "0")}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-800 rounded-full h-2">
          <div
            className="bg-[#FF8D28] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question Card */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6 space-y-6">
            <p className="text-white text-lg font-medium leading-relaxed">
              {currentQuestion?.questionText}
            </p>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition duration-200
                    ${selectedOption === null
                      ? "border-zinc-700 text-zinc-300 hover:border-[#FF8D28] hover:text-white"
                      : selectedOption === index
                        ? "border-[#FF8D28] bg-[#FF8D28]/10 text-white"
                        : "border-zinc-700 text-zinc-500 cursor-not-allowed"
                    }`}
                >
                  <span className="font-semibold text-[#FF8D28] mr-3">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FaChevronLeft className="size-4" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={selectedOption === null}
            className="flex items-center gap-2 bg-[#FF8D28] hover:bg-[#ff8d28d9] text-white"
          >
            {currentIndex === questions.length - 1 ? "Finish" : "Next"}
            <FaChevronRight className="size-4" />
          </Button>
        </div>

      </div>
    </div>
  );
};

export default QuizPage;