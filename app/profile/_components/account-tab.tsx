"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { MdWarning, MdPerson, MdSecurity } from "react-icons/md";
import { FaSignOutAlt } from "react-icons/fa";

type Props = {
  user: {
    imageUrl?: string;
    firstName?: string | null;
    fullName?: string | null;
    primaryEmailAddress?: { emailAddress: string } | null;
  } | null | undefined;
  dbUser: { _id: Id<"users"> };
  preferredName: string;
};

export const AccountTab = ({ user, preferredName }: Props) => {
  const { signOut, openUserProfile } = useClerk();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    toast.success("Logged out successfully");
  };

  return (
    <div className="space-y-6">

      {/* Account Info */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
          <MdPerson className="text-[#FF8D28] size-5" />
          Account Info
        </h2>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 ring-2 ring-[#FF8D28]/20">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback className="bg-[#FF8D28]/20 text-[#FF8D28] text-xl font-bold">
              {user?.firstName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white font-semibold">
              {preferredName || user?.fullName}
            </p>
            <p className="text-zinc-400 text-sm">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
          <Button
            onClick={() => openUserProfile()}
            className="ml-auto bg-zinc-800 hover:bg-zinc-700 text-white"
            size="sm"
          >
            Manage Account
          </Button>
        </div>
      </div>

      {/* Security */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <MdSecurity className="text-[#FF8D28] size-5" />
          Security
        </h2>
        <div className="flex items-center justify-between py-3 border-b border-zinc-800">
          <div>
            <p className="text-white text-sm font-medium">Password</p>
            <p className="text-zinc-500 text-xs">
              Managed via Clerk authentication
            </p>
          </div>
          <Button
            onClick={() => openUserProfile()}
            variant="outline"
            size="sm"
          >
            Change
          </Button>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-white text-sm font-medium">
              Connected Accounts
            </p>
            <p className="text-zinc-500 text-xs">
              Google, GitHub and more
            </p>
          </div>
          <Button
            onClick={() => openUserProfile()}
            variant="outline"
            size="sm"
          >
            Manage
          </Button>
        </div>
      </div>

      {/* Sign Out */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Session</h2>
        <Button
          onClick={handleLogout}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-white gap-2"
        >
          <FaSignOutAlt className="size-4" />
          Sign Out
        </Button>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-950/20 border border-red-900/50 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-red-400 flex items-center gap-2">
          <MdWarning className="size-5" />
          Danger Zone
        </h2>
        <p className="text-zinc-400 text-sm">
          Once you delete your account, all your progress, quiz history
          and achievements will be permanently lost.
        </p>

        {!showDeleteConfirm ? (
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            variant="destructive"
            className="w-full"
          >
            Delete Account
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-red-400 text-sm font-medium">
              Are you absolutely sure? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => toast.error("Contact support to delete account")}
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};