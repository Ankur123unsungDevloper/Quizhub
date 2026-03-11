/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

import {
  Select, SelectTrigger, SelectContent,
  SelectItem, SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  MdLocalFireDepartment, MdQuiz,
  MdTrackChanges, MdEmojiEvents,
} from "react-icons/md";
import { FaEdit, FaSave } from "react-icons/fa";
import Topbar from "./_components/topbar";

// ─── Types ────────────────────────────────────────────────────────────────────
type EducationType = "school" | "college" | "competitive" | "";

const subjectMap: Record<string, string[]> = {
  school: ["Math", "Physics", "Chemistry", "Biology", "English"],
  college: ["Programming", "DSA", "Database", "Operating System", "Networks"],
  competitive: ["Math", "Physics", "Chemistry", "Reasoning", "GK"],
};

const years = Array.from(
  { length: 10 },
  (_, i) => new Date().getFullYear() + i
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({
  icon, label, value, color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number | undefined;
  color: string;
}) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-zinc-400 text-sm">{label}</p>
      <h2 className="text-3xl font-bold text-white mt-1">
        {value ?? "—"}
      </h2>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { user, isLoaded } = useUser();

  const syncUser = useMutation(api.users.syncUser);
  const saveProfile = useMutation(api.userProfiles.upsertProfile);

  const dbUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const profile = useQuery(
    api.userProfiles.getProfileByUserId,
    dbUser ? { userId: dbUser._id } : "skip"
  );

  // ── Real stats from Convex ─────────────────────────────────────────────────
  const quizzesTaken = useQuery(
    api.attempts.getQuizzesTaken,
    dbUser ? { userId: dbUser._id } : "skip"
  );
  const accuracy = useQuery(
    api.attempts.getOverallAccuracy,
    dbUser ? { userId: dbUser._id } : "skip"
  );
  const streak = useQuery(
    api.attempts.getCurrentStreak,
    dbUser ? { userId: dbUser._id } : "skip"
  );
  const achievements = useQuery(
    api.attempts.getAchievements,
    dbUser ? { userId: dbUser._id } : "skip"
  );
  const recentActivity = useQuery(
    api.attempts.getRecentActivity,
    dbUser ? { userId: dbUser._id } : "skip"
  );

  // ── Form state ─────────────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [preferredName, setPreferredName] = useState("");
  const [educationType, setEducationType] = useState<EducationType>("");
  const [studentClass, setStudentClass] = useState("");
  const [branch, setBranch] = useState("");
  const [exam, setExam] = useState("");
  const [targetYear, setTargetYear] = useState<number | undefined>();
  const [strongSubjects, setStrongSubjects] = useState<string[]>([]);
  const [weakSubjects, setWeakSubjects] = useState<string[]>([]);
  const [studyHours, setStudyHours] = useState(4);

  // ── Sync Clerk user to Convex ──────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded || !user) return;
    syncUser({
      clerkId: user.id,
      name: user.fullName ?? "",
      email: user.primaryEmailAddress?.emailAddress ?? "",
    });
  }, [isLoaded, user, syncUser]);

  // ── Populate form from saved profile ──────────────────────────────────────
  const profileLoaded = useRef(false);

  useEffect(() => {
    if (!profile || profileLoaded.current) return;
    profileLoaded.current = true;

    setPreferredName(profile.preferredName ?? "");
    setEducationType((profile.educationType as EducationType) ?? "");
    setStudentClass(profile.class ?? "");
    setBranch(profile.branch ?? "");
    setExam(profile.targetExam ?? "");
    setTargetYear(profile.targetYear);
    setStrongSubjects(
      profile.strongSubjects ? profile.strongSubjects.split(",") : []
    );
    setWeakSubjects(
      profile.weakSubjects ? profile.weakSubjects.split(",") : []
    );
    setStudyHours(profile.studyHoursPerDay ?? 4);
  }, [profile]);

  const handleSave = async () => {
    if (!dbUser) return;
    try {
      await saveProfile({
        userId: dbUser._id,
        preferredName,
        educationType: educationType as "school" | "college" | "competitive",
        class: studentClass || undefined,
        branch: branch || undefined,
        targetExam: exam || undefined,
        targetYear,
        strongSubjects: strongSubjects.join(","),
        weakSubjects: weakSubjects.join(","),
        studyHoursPerDay: studyHours,
      });
      toast.success("Profile updated!");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update profile");
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (!isLoaded || !dbUser) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400 animate-pulse">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <Topbar />
        {/* ── Profile Header ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <Avatar className="h-20 w-20 ring-2 ring-[#FF8D28]/30">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback className="bg-[#FF8D28]/20 text-[#FF8D28] text-2xl font-bold">
              {user?.firstName?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">
              {preferredName || user?.fullName}
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
            {educationType && (
              <span className="text-xs bg-[#FF8D28]/10 text-[#FF8D28] border border-[#FF8D28]/20 px-2 py-0.5 rounded-full mt-2 inline-block capitalize">
                {educationType}
                {exam ? ` • ${exam}` : ""}
                {studentClass ? ` • Class ${studentClass}` : ""}
                {branch ? ` • ${branch}` : ""}
              </span>
            )}
          </div>

          <SignOutButton redirectUrl="/">
            <Button variant="destructive" size="sm">
              Logout
            </Button>
          </SignOutButton>
        </div>

        {/* ── Real Stats ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={<MdQuiz className="size-6 text-blue-400" />}
            label="Quizzes Taken"
            value={quizzesTaken}
            color="bg-blue-900/30"
          />
          <StatCard
            icon={<MdTrackChanges className="size-6 text-green-400" />}
            label="Overall Accuracy"
            value={accuracy !== undefined ? `${accuracy}%` : undefined}
            color="bg-green-900/30"
          />
          <StatCard
            icon={<MdLocalFireDepartment className="size-6 text-orange-400" />}
            label="Current Streak"
            value={streak !== undefined ? `${streak} days` : undefined}
            color="bg-orange-900/30"
          />
        </div>

        {/* ── Achievements ───────────────────────────────────────────────── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <MdEmojiEvents className="text-yellow-400 size-6" />
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
            <p className="text-zinc-500 text-sm">
              Complete quizzes to earn achievements!
            </p>
          )}
        </div>

        {/* ── Recent Activity ────────────────────────────────────────────── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
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
                  className="flex items-center justify-between bg-zinc-800 border border-zinc-700 p-4 rounded-xl"
                >
                  <div>
                    <p className="text-white font-medium">{a.topicName}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {new Date(a.completedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#FF8D28] font-bold">
                      {a.score}/{a.total}
                    </p>
                    <p className="text-zinc-500 text-xs">{a.accuracy}%</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">
              No quizzes taken yet. Start a quiz to see your activity!
            </p>
          )}
        </div>

        {/* ── Education Details ──────────────────────────────────────────── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Education Details
            </h2>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white flex items-center gap-2"
                  size="sm"
                >
                  <FaEdit className="size-4" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-[#FF8D28] hover:bg-[#ff8d28d9] text-white flex items-center gap-2"
                    size="sm"
                  >
                    <FaSave className="size-4" />
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Name row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-zinc-400 text-sm">First Name</label>
              <Input value={user?.firstName ?? ""} disabled
                className="bg-zinc-800 border-zinc-700 text-zinc-400" />
            </div>
            <div className="space-y-2">
              <label className="text-zinc-400 text-sm">Last Name</label>
              <Input value={user?.lastName ?? ""} disabled
                className="bg-zinc-800 border-zinc-700 text-zinc-400" />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-zinc-400 text-sm">Email</label>
            <Input
              value={user?.primaryEmailAddress?.emailAddress ?? ""}
              disabled
              className="bg-zinc-800 border-zinc-700 text-zinc-400"
            />
          </div>

          {/* Preferred name */}
          <div className="space-y-2">
            <label className="text-zinc-400 text-sm">
              What should we call you?
            </label>
            <Input
              value={preferredName}
              disabled={!isEditing}
              onChange={(e) => setPreferredName(e.target.value)}
              placeholder="Nickname or preferred name"
              className="bg-zinc-800 border-zinc-700 text-white disabled:text-zinc-400"
            />
          </div>

          {/* Education type */}
          <div className="space-y-2">
            <label className="text-zinc-400 text-sm">Your role</label>
            <Select
              value={educationType}
              disabled={!isEditing}
              onValueChange={(v) => {
                setEducationType(v as EducationType);
                setStudentClass("");
                setBranch("");
                setExam("");
              }}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Select education type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="school">School Student</SelectItem>
                <SelectItem value="college">College Student</SelectItem>
                <SelectItem value="competitive">Competitive Exam</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dynamic field */}
          {educationType === "school" && (
            <div className="space-y-2">
              <label className="text-zinc-400 text-sm">Class</label>
              <Select value={studentClass} disabled={!isEditing}
                onValueChange={setStudentClass}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {["9", "10", "11", "12"].map((c) => (
                    <SelectItem key={c} value={c}>Class {c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {educationType === "college" && (
            <div className="space-y-2">
              <label className="text-zinc-400 text-sm">Branch</label>
              <Select value={branch} disabled={!isEditing}
                onValueChange={setBranch}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {["Engineering", "Medical", "Computer Science",
                    "Management", "Arts"].map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {educationType === "competitive" && (
            <div className="space-y-2">
              <label className="text-zinc-400 text-sm">Target Exam</label>
              <Select value={exam} disabled={!isEditing}
                onValueChange={setExam}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {["JEE", "NEET", "GATE", "CAT", "UPSC", "Other"].map((e) => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Target year */}
          <div className="space-y-2">
            <label className="text-zinc-400 text-sm">Target Year</label>
            <Select
              value={targetYear?.toString()}
              disabled={!isEditing}
              onValueChange={(v) => setTargetYear(Number(v))}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Strong subjects */}
          <div className="space-y-2">
            <label className="text-zinc-400 text-sm">Strong Subjects</label>
            <div className="flex flex-wrap gap-2">
              {subjectMap[educationType]?.map((sub) => {
                const isSelected = strongSubjects.includes(sub);
                return (
                  <button
                    key={sub}
                    disabled={!isEditing}
                    onClick={() =>
                      setStrongSubjects(
                        isSelected
                          ? strongSubjects.filter((s) => s !== sub)
                          : [...strongSubjects, sub]
                      )
                    }
                    className={`px-3 py-1.5 rounded-full text-sm transition ${
                      isSelected
                        ? "bg-green-700 text-white border border-green-500"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weak subjects */}
          <div className="space-y-2">
            <label className="text-zinc-400 text-sm">Weak Subjects</label>
            <div className="flex flex-wrap gap-2">
              {subjectMap[educationType]?.map((sub) => {
                const isSelected = weakSubjects.includes(sub);
                return (
                  <button
                    key={sub}
                    disabled={!isEditing}
                    onClick={() =>
                      setWeakSubjects(
                        isSelected
                          ? weakSubjects.filter((s) => s !== sub)
                          : [...weakSubjects, sub]
                      )
                    }
                    className={`px-3 py-1.5 rounded-full text-sm transition ${
                      isSelected
                        ? "bg-red-800 text-white border border-red-600"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Study hours */}
          <div className="space-y-2">
            <label className="text-zinc-400 text-sm">
              Daily Study Hours
            </label>
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="40" cy="40" r="32"
                    stroke="#3f3f46" strokeWidth="6" fill="none" />
                  <circle cx="40" cy="40" r="32"
                    stroke="#FF8D28" strokeWidth="6" fill="none"
                    strokeDasharray={2 * Math.PI * 32}
                    strokeDashoffset={
                      2 * Math.PI * 32 * (1 - studyHours / 12)
                    }
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                  {studyHours}h
                </div>
              </div>
              {isEditing && (
                <input
                  type="range" min={1} max={12}
                  value={studyHours}
                  onChange={(e) => setStudyHours(Number(e.target.value))}
                  className="flex-1 accent-[#FF8D28]"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
