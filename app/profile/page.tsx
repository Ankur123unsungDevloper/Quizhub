/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import {
  useState,
  useEffect
} from "react";

import {
  useUser,
  UserProfile,
  SignOutButton
} from "@clerk/nextjs";

import {
  useMutation,
  useQuery
} from "convex/react";

import { api } from "@/convex/_generated/api";

import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select";
import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import Topbar from "./_components/topbar";

const ProfilePage = () => {
  const { user, isLoaded } = useUser()

  const syncUser = useMutation(api.users.syncUser)
  const saveProfile = useMutation(api.userProfiles.upsertProfile)

  const dbUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  )

  const profile = useQuery(
    api.userProfiles.getProfileByUserId,
    dbUser ? { userId: dbUser._id } : "skip"
  )

  const [editOpen, setEditOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [preferredName, setPreferredName] = useState("")
  const [educationType, setEducationType] = useState("")

  const [studentClass, setStudentClass] = useState("")
  const [branch, setBranch] = useState("")
  const [exam, setExam] = useState("")

  const [targetYear, setTargetYear] = useState<number | undefined>()
  const [strongSubjects, setStrongSubjects] = useState<string[]>([])
  const [weakSubjects, setWeakSubjects] = useState<string[]>([])
  const [studyHours, setStudyHours] = useState(4)

  useEffect(() => {
    if (!isLoaded || !user) return
    syncUser({
      clerkId: user.id,
      name: user.fullName ?? "",
      email: user.primaryEmailAddress?.emailAddress ?? ""
    })
  }, [isLoaded, user, syncUser])

  useEffect(() => {
    if (!profile) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreferredName(profile.preferredName ?? "")
    setEducationType(profile.educationType ?? "")
    setStudentClass(profile.class ?? "")
    setBranch(profile.branch ?? "")
    setExam(profile.targetExam ?? "")
    setTargetYear(profile.targetYear)
    setStrongSubjects(profile.strongSubjects?.split(",") ?? [])
    setWeakSubjects(profile.weakSubjects?.split(",") ?? [])
    setStudyHours(profile.studyHoursPerDay ?? 4)

  }, [profile])

  const handleSaveEducation = async () => {
    if (!dbUser) return
    try {
      await saveProfile({
        userId: dbUser._id,
        preferredName,
        educationType: educationType as any,
        class: studentClass || undefined,
        branch: branch || undefined,
        targetExam: exam || undefined,
        targetYear,
        strongSubjects: strongSubjects.join(","),
        weakSubjects: weakSubjects.join(","),
        studyHoursPerDay: studyHours
      })
      toast.success("Education details updated")
      setIsEditing(false)
    } catch {
      toast.error("Failed to update education details")
    }
  }

  if (!isLoaded || !dbUser) {
    return <div className="text-white p-6">Loading...</div>
  }

  const stats = [
    { label: "Quizzes Taken", value: 128 },
    { label: "Accuracy", value: "84%" },
    { label: "Current Streak", value: "7 Days" }
  ]

  const achievements = [
    "🔥 7 Day Streak",
    "🎯 90% Accuracy",
    "🏆 Top 10%"
  ]

  const activity = [
    { quiz: "JavaScript Basics", score: "8/10" },
    { quiz: "React Fundamentals", score: "9/10" },
    { quiz: "Machine Learning", score: "7/10" }
  ]

  const subjectMap: Record<string, string[]> = {
    school: ["Math", "Physics", "Chemistry", "Biology", "English"],
    college: ["Programming", "DSA", "Database", "Operating System", "Networks"],
    competitive: ["Math", "Physics", "Chemistry", "Reasoning", "GK"]
  }


  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i)

  return (
    <div className="w-full min-h-screen p-2">
      <Topbar />
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* PROFILE HEADER */}
        <div className="flex items-center gap-6 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback>
              {user?.firstName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {preferredName || user?.fullName}
            </h1>
            <p className="text-zinc-400">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
          <div className="ml-auto flex gap-3">
            <Button
              onClick={() => setEditOpen(true)}
              className="bg-[#FF8D28] hover:bg-[#ff8d28d9] text-white"
            >
              Edit Profile
            </Button>
            <SignOutButton redirectUrl="/">
              <Button variant="destructive">
                Logout
              </Button>
            </SignOutButton>
          </div>
        </div>
        {/* STATS */}
        <div className="grid grid-cols-3 gap-6">
          {stats.map((s, i) => (
            <div
              key={i}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
            >
              <p className="text-zinc-400">{s.label}</p>
              <h2 className="text-3xl font-bold text-white mt-2">
                {s.value}
              </h2>
            </div>
          ))}
        </div>
        {/* ACHIEVEMENTS */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Achievements
          </h2>
          <div className="flex gap-4">
            {achievements.map((a, i) => (
              <div
                key={i}
                className="bg-zinc-800 px-4 py-2 rounded-lg text-white"
              >
                {a}
              </div>
            ))}
          </div>
        </div>
        {/* EDUCATION DETAILS */}
        <div className="bg-zinc-900 border border-zinc-800 w-full rounded-xl p-6 space-y-6">
          <h2 className="text-2xl font-semibold text-white">
            Education Details
          </h2>
          <div className="flex flex-row items-center justify-center w-full gap-x-30 mb-8">
            <div className="flex flex-col items-start justify-start w-full gap-2">
              <span className="flex pr-6">First Name</span>
              <Input
                value={user?.firstName ?? ""}
                disabled
              />
            </div>
            <div className="flex flex-col items-start justify-start w-full gap-2">
              <span className="flex pr-6">Last Name</span>
              <Input
                value={user?.lastName ?? ""}
                disabled
              />
            </div>
          </div>
          <div className="flex flex-col items-start justify-start w-full gap-2">
            <span>Email Id</span>
            <Input
              value={user?.primaryEmailAddress?.emailAddress ?? ""}
              disabled
            />
          </div>
          <div className="flex flex-col items-start justify-start w-full gap-2">
            <span>What should we call you?</span>
            <Input
              value={preferredName}
              disabled={!isEditing}
              onChange={(e)=>setPreferredName(e.target.value)}
            />
          </div>
          <div className="flex flex-col items-start justify-start w-full gap-2">
            <span>What is your role?</span>
            <Select
              value={educationType}
              disabled={!isEditing}
              onValueChange={(value) => {
                setEducationType(value)
                // Reset dependent fields when education type changes
                setStudentClass("")
                setBranch("")
                setExam("")
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Education type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="school">School</SelectItem>
                <SelectItem value="college">College</SelectItem>
                <SelectItem value="competitive">Competitive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col items-start justify-start w-full gap-2">
            {educationType === "school" && (
              <>
                <span>Which class are you in?</span>
                <Select
                  value={studentClass}
                  disabled={!isEditing}
                  onValueChange={setStudentClass}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9">9</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="11">11</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            {educationType === "college" && (
              <>
                <span>Which branch are you in?</span>
                <Select
                  value={branch}
                  disabled={!isEditing}
                  onValueChange={setBranch}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Medical">Medical</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                    <SelectItem value="Arts">Arts</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            {educationType === "competitive" && (
              <>
                <span>Which exam are you preparing for?</span>
                <Select
                  value={exam}
                  disabled={!isEditing}
                  onValueChange={setExam}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Target Exam" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JEE">JEE</SelectItem>
                    <SelectItem value="NEET">NEET</SelectItem>
                    <SelectItem value="GATE">GATE</SelectItem>
                    <SelectItem value="CAT">CAT</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
          <div className="flex flex-col items-start justify-start w-full gap-2 mb-8">
            <span>Which year are you targeting?</span>
            <Select
              value={targetYear?.toString()}
              disabled={!isEditing}
              onValueChange={(v) => setTargetYear(Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Target Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col items-start justify-start w-full gap-2">
            <span>What are your strong subjects?</span>
            <div className="flex flex-wrap gap-2 mb-2">
              {strongSubjects.map((sub) => (
                <div
                  key={sub}
                  className="bg-orange-500 text-white px-3 py-1 rounded-full flex items-center gap-2"
                >
                  {sub}
                  {isEditing && (
                    <button
                      onClick={() =>
                        setStrongSubjects(strongSubjects.filter((s) => s !== sub))
                      }
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isEditing && (
              <div className="flex flex-wrap gap-2">
                {subjectMap[educationType]?.map((sub) => (
                  <Button
                    key={sub}
                    size="sm"
                    variant={strongSubjects.includes(sub) ? "default" : "outline"}
                    disabled={!isEditing}
                    onClick={() => {

                      if (strongSubjects.includes(sub)) {
                        setStrongSubjects(
                          strongSubjects.filter((s) => s !== sub)
                        )
                      } else {
                        setStrongSubjects([...strongSubjects, sub])
                      }

                    }}
                  >
                    {sub}
                  </Button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col items-start justify-start w-full gap-2">
            <span>What are your weak subjects?</span>
            <div className="flex flex-wrap gap-2 mb-2">
              {weakSubjects.map((sub) => (
                <div
                  key={sub}
                  className="bg-orange-500 text-white px-3 py-1 rounded-full flex items-center gap-2"
                >
                  {sub}
                  {isEditing && (
                    <button
                      onClick={() =>
                        setWeakSubjects(weakSubjects.filter((s) => s !== sub))
                      }
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isEditing && (
              <div className="flex flex-wrap gap-2">
                {subjectMap[educationType]?.map((sub) => (
                  <Button
                    key={sub}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!weakSubjects.includes(sub)) {
                        setWeakSubjects([...weakSubjects, sub])
                      }
                    }}
                  >
                    {sub}
                  </Button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col items-start justify-start w-full gap-2">
            <span>How many hours do you study per day?</span>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#3f3f46"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#FF8D28"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={
                      2 * Math.PI * 40 * (1 - studyHours / 12)
                    }
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                  {studyHours}h
                </div>
              </div>
              {isEditing && (
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={studyHours}
                  onChange={(e) => setStudyHours(Number(e.target.value))}
                />
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              disabled={isEditing}
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Edit
            </Button>
            <Button
              disabled={!isEditing}
              onClick={handleSaveEducation}
              className="bg-[#FF8D28] hover:bg-[#ff8d28d9] text-white"
            >
              Update
            </Button>
          </div>
        </div>
      </div>
      {/* RECENT ACTIVITY */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Recent Activity
        </h2>
        <div className="space-y-3">
          {activity.map((a, i) => (
            <div
              key={i}
              className="flex justify-between bg-zinc-800 p-4 rounded-lg"
            >
              <span className="text-white">
                {a.quiz}
              </span>
              <span className="text-zinc-400">
                {a.score}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* EDIT PROFILE MODAL */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <UserProfile routing="hash" />
            <div className="flex justify-end mt-4">
              <Button onClick={() => setEditOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfilePage