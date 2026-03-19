"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  MdPalette, MdNotifications, MdSecurity, 
  MdLanguage, MdDeleteForever, MdArrowBack,
  MdChevronRight, MdPrivacyTip
} from "react-icons/md";
import { FaSignOutAlt } from "react-icons/fa";
import { RiVipCrownFill } from "react-icons/ri";

// ── Toggle component ──────────────────────────────────────────────────────────
const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`w-11 h-6 rounded-full transition-all duration-300 relative shrink-0 ${
      enabled ? "bg-[#FF8D28]" : "bg-zinc-700"
    }`}
  >
    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
      enabled ? "left-6" : "left-1"
    }`} />
  </button>
);

// ── Section wrapper ───────────────────────────────────────────────────────────
const Section = ({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-800">
      <Icon className="size-4 text-[#FF8D28]" />
      <h2 className="text-white font-semibold text-sm">{title}</h2>
    </div>
    <div className="divide-y divide-zinc-800">{children}</div>
  </div>
);

// ── Row component ─────────────────────────────────────────────────────────────
const Row = ({
  label,
  description,
  right,
  onClick,
  danger,
}: {
  label: string;
  description?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between px-5 py-4 ${
      onClick ? "cursor-pointer hover:bg-zinc-800/50 transition-colors" : ""
    }`}
  >
    <div>
      <p className={`text-sm font-medium ${danger ? "text-red-400" : "text-white"}`}>{label}</p>
      {description && <p className="text-zinc-500 text-xs mt-0.5">{description}</p>}
    </div>
    {right ?? (onClick && <MdChevronRight className="size-4 text-zinc-600" />)}
  </div>
);

export default function SettingsPage() {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const router = useRouter();

  // ── Appearance ────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState<"dark" | "darker" | "system">("dark");

  // ── Notifications ─────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState({
    dailyReminder:   true,
    achievements:    true,
    weeklyReport:    false,
    newContent:      true,
    examAlerts:      true,
  });

  const toggleNotif = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success(`${key} ${!notifications[key] ? "enabled" : "disabled"}`);
  };

  // ── Language ──────────────────────────────────────────────────────────────
  const [language, setLanguage] = useState("English");

  // ── Privacy ───────────────────────────────────────────────────────────────
  const [privacy, setPrivacy] = useState({
    shareProgress:    false,
    showOnLeaderboard: true,
    allowAnalytics:   true,
    personalizedAds:  false,
  });

  const togglePrivacy = (key: keyof typeof privacy) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success(`Preference updated`);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    toast.success("Signed out successfully");
  };

  const handleDeleteAccount = () => {
    toast.error("To delete your account, please contact support@quizhub.ind.in");
  };

  const themes = [
    { id: "dark" as const,   label: "Dark",   preview: "bg-zinc-950" },
    { id: "darker" as const, label: "Darker", preview: "bg-black" },
    { id: "system" as const, label: "System", preview: "bg-gradient-to-br from-zinc-950 to-zinc-700" },
  ];

  const languages = ["English", "Hindi", "Bengali", "Tamil", "Telugu", "Marathi"];

  return (
    <div className="min-h-screen bg-zinc-950 pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-6 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors"
          >
            <MdArrowBack className="size-4 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Settings</h1>
            <p className="text-zinc-500 text-xs mt-0.5">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>

        {/* Appearance */}
        <Section title="Appearance" icon={MdPalette}>
          <div className="px-5 py-4 space-y-3">
            <p className="text-zinc-400 text-xs">Choose your theme</p>
            <div className="grid grid-cols-3 gap-3">
              {themes.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    document.documentElement.setAttribute("data-theme", t.id);
                    toast.success(`Theme set to ${t.label}`);
                  }}
                  className={`h-14 rounded-xl border-2 ${t.preview} flex items-end p-2 transition-all ${
                    theme === t.id
                      ? "border-[#FF8D28]"
                      : "border-zinc-700 hover:border-zinc-500"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-zinc-400 text-xs">{t.label}</span>
                    {theme === t.id && <span className="text-[#FF8D28] text-xs">✓</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notifications" icon={MdNotifications}>
          {(Object.entries({
            dailyReminder:   { label: "Daily Study Reminder",  desc: "Get reminded to hit your daily goal" },
            achievements:    { label: "Achievement Alerts",    desc: "When you earn a new badge or milestone" },
            weeklyReport:    { label: "Weekly Report",         desc: "Summary of your weekly performance" },
            newContent:      { label: "New Content Alerts",    desc: "When new quizzes are added for your exam" },
            examAlerts:      { label: "Exam Date Reminders",   desc: "Countdown alerts as your exam approaches" },
          }) as [keyof typeof notifications, { label: string; desc: string }][]).map(([key, { label, desc }]) => (
            <Row
              key={key}
              label={label}
              description={desc}
              right={
                <Toggle
                  enabled={notifications[key]}
                  onChange={() => toggleNotif(key)}
                />
              }
            />
          ))}
        </Section>

        {/* Language */}
        <Section title="Language" icon={MdLanguage}>
          <div className="px-5 py-4 space-y-2">
            <p className="text-zinc-400 text-xs mb-3">Interface language</p>
            <div className="grid grid-cols-3 gap-2">
              {languages.map(lang => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    toast.success(`Language set to ${lang}`);
                  }}
                  className={`py-2 px-3 rounded-xl text-sm border transition-all ${
                    language === lang
                      ? "bg-[#FF8D28]/10 border-[#FF8D28]/40 text-[#FF8D28] font-medium"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            {language !== "English" && (
              <p className="text-zinc-600 text-xs mt-2">
                * Full translation coming soon. Some content may remain in English.
              </p>
            )}
          </div>
        </Section>

        {/* Privacy & Data */}
        <Section title="Privacy & Data" icon={MdPrivacyTip}>
          {(Object.entries({
            shareProgress:     { label: "Share Progress",        desc: "Allow friends to see your quiz scores" },
            showOnLeaderboard: { label: "Show on Leaderboard",   desc: "Appear in the topper leaderboard" },
            allowAnalytics:    { label: "Usage Analytics",       desc: "Help us improve by sharing anonymous usage data" },
            personalizedAds:   { label: "Personalised Content",  desc: "Show content based on your study patterns" },
          }) as [keyof typeof privacy, { label: string; desc: string }][]).map(([key, { label, desc }]) => (
            <Row
              key={key}
              label={label}
              description={desc}
              right={
                <Toggle
                  enabled={privacy[key]}
                  onChange={() => togglePrivacy(key)}
                />
              }
            />
          ))}
          <Row
            label="Download My Data"
            description="Get a copy of all your quiz history and profile data"
            onClick={() => toast.info("Data export will be emailed to you within 24 hours")}
          />
          <Row
            label="Clear Quiz History"
            description="Remove all your attempt history and stats"
            onClick={() => toast.error("This will delete all your progress. Contact support to proceed.")}
            danger
          />
        </Section>

        {/* Security */}
        <Section title="Security & Account" icon={MdSecurity}>
          <Row
            label="Manage Account"
            description="Change password, connected accounts, 2FA"
            onClick={() => openUserProfile()}
          />
          <Row
            label="Active Sessions"
            description="View and manage your active login sessions"
            onClick={() => openUserProfile()}
          />
          <Row
            label="Subscription"
            description="Manage your plan and billing"
            onClick={() => router.push("/subscription")}
            right={
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Free Plan</span>
                <RiVipCrownFill className="size-3.5 text-zinc-600" />
                <MdChevronRight className="size-4 text-zinc-600" />
              </div>
            }
          />
        </Section>

        {/* Danger zone */}
        <Section title="Account Actions" icon={MdDeleteForever}>
          <Row
            label="Sign Out"
            description="Sign out of your account on this device"
            onClick={handleSignOut}
            right={<FaSignOutAlt className="size-4 text-zinc-500" />}
          />
          <Row
            label="Delete Account"
            description="Permanently delete your account and all data"
            onClick={handleDeleteAccount}
            danger
            right={<MdDeleteForever className="size-4 text-red-500" />}
          />
        </Section>

        {/* App info */}
        <div className="text-center text-zinc-700 text-xs space-y-1 pb-4">
          <p>Quizhub v1.0.0</p>
          <p>Made with ❤️ for Indian students</p>
        </div>
      </div>
    </div>
  );
}