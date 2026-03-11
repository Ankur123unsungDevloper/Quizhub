"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LineChart, Line,
  CartesianGrid, Legend,
} from "recharts";

type Props = {
  dbUser: { _id: Id<"users"> };
};

export const ProgressTab = ({ dbUser }: Props) => {
  const subjectAccuracy = useQuery(api.attempts.getSubjectAccuracy, { userId: dbUser._id });
  const scoreTrend = useQuery(api.attempts.getScoreTrend, { userId: dbUser._id });
  const weakStrong = useQuery(api.attempts.getWeakStrongTopics, { userId: dbUser._id });

  const hasData = subjectAccuracy && subjectAccuracy.length > 0;

  if (!hasData) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
        <p className="text-4xl mb-4">📊</p>
        <p className="text-white font-semibold text-lg">No progress data yet</p>
        <p className="text-zinc-400 text-sm mt-2">
          Complete some quizzes to see your progress charts here!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Subject Accuracy Bar Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6">
          Accuracy by Subject
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={subjectAccuracy}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
            <XAxis dataKey="subject" stroke="#71717a" tick={{ fontSize: 12 }} />
            <YAxis stroke="#71717a" tick={{ fontSize: 12 }} domain={[0, 100]}
              tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "8px" }}
              labelStyle={{ color: "#fff" }}
              formatter={(value) => [`${Number(value)}%`, "Accuracy"]}
            />
            <Bar dataKey="accuracy" fill="#FF8D28" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Score Trend Line Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6">
          Score Trend (Last 10 Quizzes)
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={scoreTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
            <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 11 }} />
            <YAxis stroke="#71717a" tick={{ fontSize: 12 }}
              tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "8px" }}
              labelStyle={{ color: "#fff" }}
              formatter={(value) => [`${Number(value)}%`, "Accuracy"]}
            />
            <Legend />
            <Line type="monotone" dataKey="accuracy" stroke="#FF8D28"
              strokeWidth={2} dot={{ fill: "#FF8D28", r: 4 }} name="Accuracy %" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Weak vs Strong Topics */}
      {weakStrong && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Strong Topics */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              💪 Strong Topics
            </h2>
            {weakStrong.strong.length > 0 ? (
              <div className="space-y-3">
                {weakStrong.strong.map((t: {
                  topicName: string;
                  subjectName: string;
                  accuracy: number;
                }, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">{t.topicName}</p>
                      <p className="text-zinc-500 text-xs">{t.subjectName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full"
                          style={{ width: `${t.accuracy}%` }} />
                      </div>
                      <span className="text-green-400 text-sm font-semibold w-10 text-right">
                        {t.accuracy}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">Keep practicing!</p>
            )}
          </div>

          {/* Weak Topics */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              🎯 Needs Work
            </h2>
            {weakStrong.weak.length > 0 ? (
              <div className="space-y-3">
                {weakStrong.weak.map((t: {
                  topicName: string;
                  subjectName: string;
                  accuracy: number;
                }, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">{t.topicName}</p>
                      <p className="text-zinc-500 text-xs">{t.subjectName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full"
                          style={{ width: `${t.accuracy}%` }} />
                      </div>
                      <span className="text-red-400 text-sm font-semibold w-10 text-right">
                        {t.accuracy}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">No weak topics yet!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};