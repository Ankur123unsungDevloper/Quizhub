"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  MdQuiz, MdTrackChanges,
  MdLocalFireDepartment, MdEmojiEvents,
  MdArrowForward,
} from "react-icons/md";

type Props = {
  dbUser: { _id: Id<"users"> };
  user: { fullName?: string | null } | null | undefined;
  preferredName: string;
  completionPercent: number;
};

const EmptyState = ({
  icon, title, description, action, onAction,
}: {
  icon: string;
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
}) => (
  <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
    <span className="text-5xl">{icon}</span>
    <p className="text-white font-semibold">{title}</p>
    <p className="text-zinc-500 text-sm max-w-xs">{description}</p>
    {action && onAction && (
      <Button
        onClick={onAction}
        size="sm"
        className="bg-[#FF8D28] hover:bg-[#ff8d28d9] text-white mt-2 gap-2"
      >
        {action}
        <MdArrowForward className="size-4" />
      </Button>
    )}
  </div>
);

export const OverviewTab = ({ dbUser, preferredName, user, completionPercent }: Props) => {
  const router = useRouter();
  const quizzesTaken = useQuery(api.attempts.getQuizzesTaken, { userId: dbUser._id });
  const accuracy = useQuery(api.attempts.getOverallAccuracy, { userId: dbUser._id });
  const streak = useQuery(api.attempts.getCurrentStreak, { userId: dbUser._id });
  const achievements = useQuery(api.attempts.getAchievements, { userId: dbUser._id });
  const recentActivity = useQuery(api.attempts.getRecentActivity, { userId: dbUser._id });

  const isNewUser = quizzesTaken === 0;
  const displayName = preferredName || user?.fullName || "Student";

  return (
    <div className="space-y-6">

      {/* Welcome Banner — shows for new users */}
      {isNewUser && (
        <div className="bg-linear-to-br from-[#FF8D28]/20 via-orange-900/10 to-zinc-900 border border-[#FF8D28]/20 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-white text-xl font-bold">
              Welcome, {displayName}! 👋
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              You are all set! Here is what you can do next.
            </p>
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            {[
              {
                done: completionPercent >= 40,
                label: "Complete your education profile",
                action: "education",
              },
              {
                done: (quizzesTaken ?? 0) > 0,
                label: "Take your first quiz",
                action: "quiz",
              },
              {
                done: completionPercent >= 80,
                label: "Set your study goals",
                action: "preferences",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-zinc-900/60 rounded-xl px-4 py-3"
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    item.done
                      ? "bg-green-500 border-green-500"
                      : "border-zinc-600"
                  }`}
                >
                  {item.done && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
                <span
                  className={`text-sm ${
                    item.done ? "text-zinc-400 line-through" : "text-white"
                  }`}
                >
                  {item.label}
                </span>
                {!item.done && item.action === "quiz" && (
                  <Button
                    size="sm"
                    onClick={() => router.push("/")}
                    className="ml-auto bg-[#FF8D28]/10 hover:bg-[#FF8D28]/20 text-[#FF8D28] border border-[#FF8D28]/20 text-xs px-2 py-1 h-auto"
                  >
                    Start →
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Profile completion */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Profile completion</span>
              <span className="text-white font-semibold">{completionPercent}%</span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF8D28] rounded-full transition-all duration-700"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: <MdQuiz className="size-6 text-blue-400" />,
            label: "Quizzes Taken",
            value: quizzesTaken ?? "—",
            color: "bg-blue-900/30",
          },
          {
            icon: <MdTrackChanges className="size-6 text-green-400" />,
            label: "Overall Accuracy",
            value: accuracy !== undefined ? `${accuracy}%` : "—",
            color: "bg-green-900/30",
          },
          {
            icon: <MdLocalFireDepartment className="size-6 text-orange-400" />,
            label: "Current Streak",
            value: streak !== undefined ? `${streak} days` : "—",
            color: "bg-orange-900/30",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-zinc-400 text-sm">{stat.label}</p>
              <p className="text-white text-2xl font-bold mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <MdEmojiEvents className="text-yellow-400 size-5" />
          Achievements
        </h2>
        {achievements && achievements.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {achievements.map((a: string, i: number) => (
              <div
                key={i}
                className="bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-xl text-white text-sm"
              >
                {a}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🏆"
            title="No achievements yet"
            description="Complete quizzes and maintain streaks to earn achievements!"
            action="Take a Quiz"
            onAction={() => router.push("/")}
          />
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Recent Activity
        </h2>
        {recentActivity && recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((a: {
              topicName: string;
              score: number;
              total: number;
              accuracy: number;
              completedAt: number;
            }, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between bg-zinc-800 border border-zinc-700 p-4 rounded-xl hover:border-zinc-600 transition"
              >
                <div>
                  <p className="text-white font-medium">{a.topicName}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    {new Date(a.completedAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[#FF8D28] font-bold">{a.score}/{a.total}</p>
                  <p className={`text-xs font-medium ${
                    a.accuracy >= 75 ? "text-green-400" :
                    a.accuracy >= 50 ? "text-yellow-400" : "text-red-400"
                  }`}>
                    {a.accuracy}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="📝"
            title="No activity yet"
            description="Start taking quizzes to track your progress here!"
            action="Browse Quizzes"
            onAction={() => router.push("/")}
          />
        )}
      </div>
    </div>
  );
};