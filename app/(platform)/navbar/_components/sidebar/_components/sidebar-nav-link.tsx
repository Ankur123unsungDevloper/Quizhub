"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ElementType } from "react";
import { cn } from "@/lib/utils";

interface SidebarNavLinkProps {
  href: string;
  label: string;
  icon: ElementType;
  highlight?: boolean;
  onClick?: () => void;
}

export const SidebarNavLink = ({
  href,
  label,
  icon: Icon,
  highlight,
  onClick,
}: SidebarNavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-[#FF8D28]/15 text-[#FF8D28]"
          : highlight
          ? "text-yellow-400 hover:bg-yellow-400/10"
          : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
      )}
    >
      {/* Active bar indicator */}
      <span
        className={cn(
          "absolute left-0 w-1 h-6 rounded-r-full bg-[#FF8D28] transition-all duration-200",
          isActive ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
        )}
      />

      <Icon
        className={cn(
          "w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
          isActive ? "text-[#FF8D28]" : highlight ? "text-yellow-400" : "text-zinc-400 group-hover:text-white"
        )}
      />
      <span>{label}</span>

      {/* Crown glow for subscription */}
      {highlight && (
        <span className="ml-auto text-[10px] font-bold tracking-wider text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded-md">
          PRO
        </span>
      )}
    </Link>
  );
};