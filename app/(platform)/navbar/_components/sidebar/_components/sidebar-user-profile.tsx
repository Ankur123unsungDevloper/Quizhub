/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { RiVipCrownLine } from "react-icons/ri";
import { SlUser } from "react-icons/sl";
import Image from "next/image";

export const SidebarUserProfile = () => {
  const { user } = useUser();

  const dbUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  if (!user) return null;

  const isSubscribed = false; // replace with real subscription check later

  return (
    <div className="px-4 py-5 border-b border-zinc-800/60">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          {user.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt={user.fullName ?? "User"}
              fill
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#FF8D28]/40"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center ring-2 ring-[#FF8D28]/40">
              <SlUser className="w-5 h-5 text-[#FF8D28]" />
            </div>
          )}
          {/* Online dot */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-zinc-950" />
        </div>

        {/* Name & status */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {user.fullName ?? "Student"}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isSubscribed ? (
              <span className="flex items-center gap-1 text-xs text-yellow-400 font-medium">
                <RiVipCrownLine className="w-3 h-3" />
                Pro Member
              </span>
            ) : (
              <span className="text-xs text-zinc-500">Free Plan</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};