"use client";

import { ProfileTab } from "../page";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  MdDashboard, MdSchool, MdBarChart,
  MdTune, MdManageAccounts,
} from "react-icons/md";
import { cn } from "@/lib/utils";

type SidebarProps = {
  activeTab: ProfileTab;
  setActiveTab: (tab: ProfileTab) => void;
  user: {
    imageUrl?: string;
    firstName?: string | null;
    fullName?: string | null;
  } | null | undefined;
  preferredName: string;
  educationType: string;
  completionPercent: number;
};

const tabs = [
  { id: "overview",     label: "Overview",     icon: MdDashboard  },
  { id: "education",    label: "Education",    icon: MdSchool     },
  { id: "progress",     label: "Progress",     icon: MdBarChart   },
  { id: "preferences",  label: "Preferences",  icon: MdTune       },
  { id: "account",      label: "Account",      icon: MdManageAccounts },
] as const;

export const ProfileSidebar = ({
  activeTab,
  setActiveTab,
  user,
  preferredName,
  educationType,
  completionPercent,
}: SidebarProps) => {

  const completionColor =
    completionPercent >= 80 ? "bg-green-500" :
    completionPercent >= 50 ? "bg-[#FF8D28]" :
    "bg-red-500";

  const completionLabel =
    completionPercent >= 80 ? "Great profile! 🎉" :
    completionPercent >= 50 ? "Almost there!" :
    "Complete your profile";

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
      <aside className="w-64 shrink-0 hidden md:block">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden sticky top-24">

          {/* User Card */}
          <div className="p-6 border-b border-zinc-800 flex flex-col items-center text-center gap-3">
            <Avatar className="h-16 w-16 ring-2 ring-[#FF8D28]/30">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback className="bg-[#FF8D28]/20 text-[#FF8D28] text-xl font-bold">
                {user?.firstName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-semibold truncate max-w-45">
                {preferredName || user?.fullName}
              </p>
              {educationType && (
                <span className="text-xs text-[#FF8D28] capitalize mt-1 block">
                  {educationType} Student
                </span>
              )}
            </div>

            {/* Completion Bar */}
            <div className="w-full space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">{completionLabel}</span>
                <span className="text-white font-semibold">
                  {completionPercent}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${completionColor}`}
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ProfileTab)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[#FF8D28]/10 text-[#FF8D28] border border-[#FF8D28]/20"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  )}
                >
                  <Icon className="size-5 shrink-0" />
                  {tab.label}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF8D28]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* ── Mobile Bottom Tab Bar ────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-zinc-900 border-t border-zinc-800 px-2 py-2">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ProfileTab)}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all",
                  isActive
                    ? "text-[#FF8D28]"
                    : "text-zinc-500"
                )}
              >
                <Icon className="size-5" />
                <span className="text-xs font-medium">{tab.label}</span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-[#FF8D28]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};