"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FaSearch, FaUserGraduate } from "react-icons/fa";
import { MdQuiz, MdAccessTime } from "react-icons/md";
import { useState } from "react";
import { Input } from "@/components/ui/input";

type StudentRow = {
  _id: string;
  name: string;
  email: string;
  createdAt: number;
  totalAttempts: number;
  avgAccuracy: number;
  lastActive: number;
};

const getAccuracyColor = (accuracy: number) => {
  if (accuracy >= 75) return "text-green-400";
  if (accuracy >= 50) return "text-yellow-400";
  return "text-red-400";
};

const timeAgo = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
};

export default function AdminStudentsPage() {
  const students = useQuery(api.admin.getAllStudentsWithStats);
  const [search, setSearch] = useState("");

  const filtered = students?.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  // ── Summary stats ──────────────────────────────────────────────────────────
  const totalStudents = students?.length ?? 0;
  const activeStudents =
    students?.filter((s) => s.totalAttempts > 0).length ?? 0;
  const avgPlatformAccuracy =
    students && students.length > 0
      ? Math.round(
          students.reduce((sum, s) => sum + s.avgAccuracy, 0) /
            students.length
        )
      : 0;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Students</h1>
        <p className="text-zinc-400 mt-1">
          All registered students and their activity
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-900/30">
            <FaUserGraduate className="size-5 text-blue-400" />
          </div>
          <div>
            <p className="text-zinc-400 text-sm">Total Students</p>
            <p className="text-white text-2xl font-bold">{totalStudents}</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-900/30">
            <MdQuiz className="size-5 text-green-400" />
          </div>
          <div>
            <p className="text-zinc-400 text-sm">Active Students</p>
            <p className="text-white text-2xl font-bold">{activeStudents}</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-900/30">
            <MdAccessTime className="size-5 text-orange-400" />
          </div>
          <div>
            <p className="text-zinc-400 text-sm">Avg Accuracy</p>
            <p className="text-white text-2xl font-bold">
              {avgPlatformAccuracy}%
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 size-4" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[#FF8D28]"
        />
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {students === undefined ? (
          <div className="space-y-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-16 border-b border-zinc-800 animate-pulse bg-zinc-800/30"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <FaUserGraduate className="size-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400">No students found.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="p-4 text-left text-zinc-400 text-sm font-medium">
                  Student
                </th>
                <th className="p-4 text-left text-zinc-400 text-sm font-medium">
                  Joined
                </th>
                <th className="p-4 text-left text-zinc-400 text-sm font-medium">
                  Quizzes Taken
                </th>
                <th className="p-4 text-left text-zinc-400 text-sm font-medium">
                  Avg Accuracy
                </th>
                <th className="p-4 text-left text-zinc-400 text-sm font-medium">
                  Last Active
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student: StudentRow) => (
                <tr
                  key={student._id}
                  className="border-b border-zinc-800 hover:bg-zinc-800/50 transition"
                >
                  {/* Avatar + Name + Email */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-linear-to-br from-[#FF8D28] to-orange-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {student.name}
                        </p>
                        <p className="text-zinc-500 text-xs">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Joined */}
                  <td className="p-4 text-zinc-400 text-sm">
                    {new Date(student.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  {/* Quizzes Taken */}
                  <td className="p-4">
                    <span className="text-[#FF8D28] font-semibold">
                      {student.totalAttempts}
                    </span>
                    <span className="text-zinc-500 text-xs ml-1">
                      quizzes
                    </span>
                  </td>

                  {/* Accuracy */}
                  <td className="p-4">
                    {student.totalAttempts > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#FF8D28] rounded-full"
                            style={{
                              width: `${student.avgAccuracy}%`,
                            }}
                          />
                        </div>
                        <span
                          className={`text-sm font-semibold ${getAccuracyColor(
                            student.avgAccuracy
                          )}`}
                        >
                          {student.avgAccuracy}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-zinc-600 text-sm">
                        No activity
                      </span>
                    )}
                  </td>

                  {/* Last Active */}
                  <td className="p-4 text-zinc-400 text-sm">
                    {timeAgo(student.lastActive)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Count */}
      {students && (
        <p className="text-zinc-500 text-sm">
          Showing {filtered.length} of {students.length} students
        </p>
      )}
    </div>
  );
}
