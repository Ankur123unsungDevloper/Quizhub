"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { TbLogout } from "react-icons/tb";
import { Logo } from "@/components/logo";
import { SidebarUserProfile } from "./sidebar-user-profile";
import { SidebarNavLink } from "./sidebar-nav-link";
import { navItems } from "./sidebar-nav-items";

interface SidebarContentProps {
  onClose: () => void;
}

export const SidebarContent = ({ onClose }: SidebarContentProps) => {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    onClose();
    router.push("/");
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800/50">

      {/* Logo area */}
      <div className="px-5 py-5 border-b border-zinc-800/60">
        <Logo />
      </div>

      {/* User profile */}
      <SidebarUserProfile />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 relative">
        {navItems.map((item) => (
          <SidebarNavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            highlight={item.highlight}
            onClick={onClose}
          />
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-zinc-800/60" />

      {/* Logout */}
      <div className="px-3 py-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-all duration-200 group"
        >
          <TbLogout className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
          Log Out
        </button>
      </div>
    </div>
  );
};