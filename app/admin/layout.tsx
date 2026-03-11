"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import {
  MdDashboard,
  MdMenuBook,
  MdOutlineSubject,
  MdTopic,
  MdPeople,
  MdAutoAwesome,
} from "react-icons/md";
import { FaChevronRight } from "react-icons/fa";

const sidebarLinks = [
  { label: "Dashboard", href: "/admin", icon: MdDashboard },
  { label: "Exams", href: "/admin/exams", icon: MdMenuBook },
  { label: "Subjects", href: "/admin/subjects", icon: MdOutlineSubject },
  { label: "Topics", href: "/admin/topics", icon: MdTopic },
  { label: "Students", href: "/admin/students", icon: MdPeople },
  { label: "AI Agent", href: "/admin/agent", icon: MdAutoAwesome },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const isAdmin = useQuery(
    api.admin.isAdmin,
    user ? { clerkId: user.id } : "skip"
  );

  // Redirect if not admin
  useEffect(() => {
    if (isLoaded && isAdmin === false) {
      router.push("/");
    }
  }, [isLoaded, isAdmin, router]);

  if (!isLoaded || isAdmin === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="text-zinc-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-zinc-950">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">

        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-zinc-800">
          <MdAutoAwesome className="text-[#FF8D28] size-6" />
          <span className="text-white font-bold text-lg">QuizHub Admin</span>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1 p-4 flex-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href !== "/admin" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-200",
                  isActive
                    ? "bg-[#FF8D28]/10 text-[#FF8D28] border border-[#FF8D28]/20"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                )}
              >
                <Icon className="size-5" />
                {link.label}
                {isActive && (
                  <FaChevronRight className="size-3 ml-auto" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Back to site */}
        <div className="p-4 border-t border-zinc-800">
          <Link
            href="/"
            className="flex items-center gap-2 text-zinc-500 hover:text-white text-sm px-4 py-2 rounded-xl hover:bg-zinc-800 transition"
          >
            ← Back to QuizHub
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  );
}