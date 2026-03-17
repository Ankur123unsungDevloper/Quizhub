"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useConvexAuth, useQuery } from "convex/react";
import { useUser, useClerk } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";

import { SlUser } from "react-icons/sl";
import { TbLogout } from "react-icons/tb";
import { CgProfile } from "react-icons/cg";
import { IoSettings } from "react-icons/io5";
import { MdAdminPanelSettings } from "react-icons/md";
import { RiVipCrownLine } from "react-icons/ri";

const ActionButton = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  // ── Check admin role ────────────────────────────────────────────────────────
  const isAdmin = useQuery(
    api.admin.isAdmin,
    user ? { clerkId: user.id } : "skip"
  );

  const handleProfileClick = () => {
    if (isAdmin) {
      router.push("/admin");
    } else {
      router.push("/profile");
    }
  };

  const handleSubscriptionClick = () => {
    router.push("/subscription");
  }

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div>
      {/* Not logged in */}
      {!isAuthenticated && !isLoading && (
        <Button
          asChild
          className="bg-[#FF8D28] text-white hover:bg-[#FF8D28]/90 w-30 text-xl"
        >
          <Link href="/sign-in">Login</Link>
        </Button>
      )}
      {/* Logged in */}
      {isAuthenticated && !isLoading && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="relative cursor-pointer">
              <SlUser className="h-8 w-8 text-[#FF8D28]" />
              {/* Admin crown indicator */}
              {isAdmin && (
                <RiVipCrownLine className="absolute -top-2 -right-2 size-3.5 text-yellow-400" />
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52 bg-zinc-900 border-zinc-800">
            {/* User info header */}
            <DropdownMenuLabel className="px-3 py-2 border-b border-zinc-800">
              <p className="text-white text-sm font-medium truncate">
                {user?.fullName ?? "User"}
              </p>
              <p className="text-zinc-500 text-xs truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
              {isAdmin && (
                <span className="text-xs text-yellow-400 font-medium">
                  ⚡ Admin
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuGroup className="p-1">
              {/* Profile / Admin Panel */}
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white focus:text-white focus:bg-zinc-800 rounded-lg"
                onClick={handleProfileClick}
              >
                {isAdmin ? (
                  <>
                    <MdAdminPanelSettings className="size-5 text-[#FF8D28]" />
                    Admin Panel
                  </>
                ) : (
                  <>
                    <CgProfile className="size-5" />
                    Profile
                  </>
                )}
              </DropdownMenuItem>
              {/* Subscription */}
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white focus:text-white focus:bg-zinc-800 rounded-lg"
                onClick={handleSubscriptionClick}
              >
                <RiVipCrownLine className="size-5 text-yellow-400" />
                Subscription
              </DropdownMenuItem>
              {/* Settings */}
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white focus:text-white focus:bg-zinc-800 rounded-lg"
                onClick={() => router.push("/settings")}
              >
                <IoSettings className="size-5" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-zinc-800" />
            {/* Logout */}
            <DropdownMenuGroup className="p-1">
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-950/30 rounded-lg"
                onClick={handleLogout}
              >
                <TbLogout className="size-5" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default ActionButton;
