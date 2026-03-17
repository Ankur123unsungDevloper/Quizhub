/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import Topbar from "./_components/topbar";
import { ProfileSidebar } from "./_components/sidebar";
import { OverviewTab } from "./_components/overview-tab";
import { EducationTab } from "./_components/education-tab";
import { ProgressTab } from "./_components/progress-tab";
import { PreferencesTab } from "./_components/preferences-tab";
import { AccountTab } from "./_components/account-tab";
import { TabTransition } from "./_components/tab-transition";

export type ProfileTab =
  | "overview"
  | "education"
  | "progress"
  | "preferences"
  | "account";

type EducationType = "school" | "college" | "competitive" | "";

// ── Single form state object — avoids multiple setState calls in effect ───────
type FormState = {
  preferredName: string;
  educationType: EducationType;
  studentClass: string;
  branch: string;
  exam: string;
  targetYear: number | undefined;
  strongSubjects: string[];
  weakSubjects: string[];
  studyHours: number;
  studyGoal: string;
  reminderEnabled: boolean;
};

const defaultForm: FormState = {
  preferredName: "",
  educationType: "",
  studentClass: "",
  branch: "",
  exam: "",
  targetYear: undefined,
  strongSubjects: [],
  weakSubjects: [],
  studyHours: 4,
  studyGoal: "",
  reminderEnabled: false,
};

const ProfilePage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");

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

  // ── Single state object — only ONE setState call in the effect ─────────────
  const [form, setForm] = useState<FormState>(defaultForm);

  // Helper to update individual fields — useCallback prevents re-render on every keystroke
  const setField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  // ── Sync user ONCE on mount ────────────────────────────────────────────────
  const hasSynced = useRef(false);
  useEffect(() => {
    if (!isLoaded || !user || hasSynced.current) return;
    hasSynced.current = true;
    syncUser({
      clerkId: user.id,
      name: user.fullName ?? "",
      email: user.primaryEmailAddress?.emailAddress ?? "",
    });
  }, [isLoaded, user, syncUser]);

  // ── Populate form — single setState call, no cascade ──────────────────────
  const profileLoaded = useRef(false);
  useEffect(() => {
    if (!profile || profileLoaded.current) return;
    profileLoaded.current = true;

    setForm({
      preferredName: profile.preferredName ?? "",
      educationType: (profile.educationType as EducationType) ?? "",
      studentClass: profile.class ?? "",
      branch: profile.branch ?? "",
      exam: profile.targetExam ?? "",
      targetYear: profile.targetYear,
      strongSubjects: profile.strongSubjects
        ? profile.strongSubjects.split(",")
        : [],
      weakSubjects: profile.weakSubjects
        ? profile.weakSubjects.split(",")
        : [],
      studyHours: profile.studyHoursPerDay ?? 4,
      studyGoal: "",
      reminderEnabled: false,
    });
  }, [profile]);

  // ── Save handler ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!dbUser) return;

    if (!form.educationType) {
      toast.error("Please select your education type before saving");
      return;
    }

    await saveProfile({
      userId: dbUser._id,
      preferredName: form.preferredName,
      educationType: form.educationType as "school" | "college" | "competitive",
      class: form.studentClass || undefined,
      branch: form.branch || undefined,
      targetExam: form.exam || undefined,
      targetYear: form.targetYear,
      strongSubjects: form.strongSubjects.join(","),
      weakSubjects: form.weakSubjects.join(","),
      studyHoursPerDay: form.studyHours,
    });

    // Keep profileLoaded true so refetch doesn't overwrite local state
    profileLoaded.current = true;
  };

  const calculateCompletion = (): number => {
    let score = 0;
    if (form.preferredName) score += 20;
    if (form.educationType) score += 20;
    if (form.studentClass || form.branch || form.exam) score += 20;
    if (form.strongSubjects.length > 0) score += 20;
    if (form.weakSubjects.length > 0) score += 20;
    return score;
  };

  const completionPercent = calculateCompletion();

  // ── Shared props — memoized so child inputs don't remount on every keystroke ─
  const sharedProps = useMemo(() => ({
    user,
    dbUser,
    profile,
    preferredName: form.preferredName,
    setPreferredName: (v: string) => setField("preferredName", v),
    educationType: form.educationType,
    setEducationType: (v: EducationType) => setField("educationType", v),
    studentClass: form.studentClass,
    setStudentClass: (v: string) => setField("studentClass", v),
    branch: form.branch,
    setBranch: (v: string) => setField("branch", v),
    exam: form.exam,
    setExam: (v: string) => setField("exam", v),
    targetYear: form.targetYear,
    setTargetYear: (v: number | undefined) => setField("targetYear", v),
    strongSubjects: form.strongSubjects,
    setStrongSubjects: (v: string[]) => setField("strongSubjects", v),
    weakSubjects: form.weakSubjects,
    setWeakSubjects: (v: string[]) => setField("weakSubjects", v),
    studyHours: form.studyHours,
    setStudyHours: (v: number) => setField("studyHours", v),
    studyGoal: form.studyGoal,
    setStudyGoal: (v: string) => setField("studyGoal", v),
    reminderEnabled: form.reminderEnabled,
    setReminderEnabled: (v: boolean) => setField("reminderEnabled", v),
    handleSave,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [form, user, dbUser, profile]);

  // ── Early return AFTER all hooks ──────────────────────────────────────────
  if (!isLoaded || !dbUser) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400 animate-pulse">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-6 space-y-6">

        <Topbar />

        <div className="flex gap-6">
          <ProfileSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            user={user}
            preferredName={form.preferredName}
            educationType={form.educationType}
            completionPercent={completionPercent}
          />

          <div className="flex-1 min-w-0">
            <TabTransition tabKey={activeTab}>
              {activeTab === "overview" && (
                <OverviewTab
                  dbUser={dbUser}
                  user={user}
                  preferredName={form.preferredName}
                  completionPercent={completionPercent}
                />
              )}
              {activeTab === "education" && (
                <EducationTab {...sharedProps} />
              )}
              {activeTab === "progress" && (
                <ProgressTab dbUser={dbUser} />
              )}
              {activeTab === "preferences" && (
                <PreferencesTab {...sharedProps} />
              )}
              {activeTab === "account" && (
                <AccountTab
                  user={user}
                  dbUser={dbUser}
                  preferredName={form.preferredName}
                />
              )}
            </TabTransition>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;