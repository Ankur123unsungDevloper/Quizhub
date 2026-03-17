/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef } from "react";
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

  // ── Individual state vars (simple and reliable) ────────────────────────────
  const [preferredName, setPreferredName] = useState("");
  const [educationType, setEducationType] = useState<EducationType>("");
  const [studentClass, setStudentClass] = useState("");
  const [branch, setBranch] = useState("");
  const [exam, setExam] = useState("");
  const [targetYear, setTargetYear] = useState<number | undefined>();
  const [strongSubjects, setStrongSubjects] = useState<string[]>([]);
  const [weakSubjects, setWeakSubjects] = useState<string[]>([]);
  const [studyHours, setStudyHours] = useState(4);
  const [studyGoal, setStudyGoal] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);

  // ── Sync user ONCE ─────────────────────────────────────────────────────────
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

  // ── Populate from DB exactly once ─────────────────────────────────────────
  // We use a ref flag so this never runs again after first load,
  // meaning typing will never be overwritten by a re-fetch
  const profileLoaded = useRef(false);
  useEffect(() => {
    if (profile === undefined) return; // still loading
    if (profileLoaded.current) return; // already populated
    profileLoaded.current = true;

    setPreferredName(profile?.preferredName ?? "");          
    setEducationType((profile?.educationType as EducationType) ?? "");  
    setStudentClass(profile?.class ?? "");                   
    setBranch(profile?.branch ?? "");                        
    setExam(profile?.targetExam ?? "");                      
    setTargetYear(profile?.targetYear);                      
    setStrongSubjects(profile?.strongSubjects ? profile.strongSubjects.split(",") : []);  
    setWeakSubjects(profile?.weakSubjects ? profile.weakSubjects.split(",") : []);        
    setStudyHours(profile?.studyHoursPerDay ?? 4);           
  }, [profile]);

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!dbUser) return;
    if (!educationType) {
      toast.error("Please select your education type before saving");
      return;
    }
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
  };

  // ── All hooks done — early return is safe here ─────────────────────────────
  if (!isLoaded || !dbUser) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400 animate-pulse">Loading profile...</div>
      </div>
    );
  }

  const calculateCompletion = (): number => {
    let score = 0;
    if (preferredName) score += 20;
    if (educationType) score += 20;
    if (studentClass || branch || exam) score += 20;
    if (strongSubjects.length > 0) score += 20;
    if (weakSubjects.length > 0) score += 20;
    return score;
  };

  const completionPercent = calculateCompletion();

  // ── No useMemo — plain object, React handles re-renders correctly ──────────
  const sharedProps = {
    user,
    dbUser,
    profile,
    preferredName, setPreferredName,
    educationType, setEducationType,
    studentClass, setStudentClass,
    branch, setBranch,
    exam, setExam,
    targetYear, setTargetYear,
    strongSubjects, setStrongSubjects,
    weakSubjects, setWeakSubjects,
    studyHours, setStudyHours,
    studyGoal, setStudyGoal,
    reminderEnabled, setReminderEnabled,
    handleSave,
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-6 space-y-6">
        <Topbar />
        <div className="flex gap-6">
          <ProfileSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            user={user}
            preferredName={preferredName}
            educationType={educationType}
            completionPercent={completionPercent}
          />
          <div className="flex-1 min-w-0">
            <TabTransition tabKey={activeTab}>
              {activeTab === "overview" && (
                <OverviewTab
                  dbUser={dbUser}
                  user={user}
                  preferredName={preferredName}
                  completionPercent={completionPercent}
                />
              )}
              {activeTab === "education" && <EducationTab {...sharedProps} />}
              {activeTab === "progress" && <ProgressTab dbUser={dbUser} />}
              {activeTab === "preferences" && <PreferencesTab {...sharedProps} />}
              {activeTab === "account" && (
                <AccountTab user={user} dbUser={dbUser} preferredName={preferredName} />
              )}
            </TabTransition>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;