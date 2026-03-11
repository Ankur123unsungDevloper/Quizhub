"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { FaChevronLeft } from "react-icons/fa";

const Topbar = () => {
  const router = useRouter();
  const { user } = useUser();

  const dbUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const profile = useQuery(
    api.userProfiles.getProfileByUserId,
    dbUser ? { userId: dbUser._id } : "skip"
  );

  const handleBack = () => {
    // ✅ If profile is complete → go to /quizzes
    // ✅ If profile is incomplete → go back to previous page
    if (profile?.educationType) {
      router.push("/quizzes");
    } else {
      router.back();
    }
  };

  return (
    <div className="flex items-center w-full bg-zinc-800 px-4 py-3 rounded-lg relative mb-6">

      {/* Back Button */}
      <Button
        size="icon"
        onClick={handleBack}
        className="bg-[#FF8D28] hover:bg-[#FF8D28]/90 text-white rounded-full"
      >
        <FaChevronLeft />
      </Button>

      {/* Center Title */}
      <h2 className="absolute left-1/2 -translate-x-1/2 text-2xl md:text-3xl font-bold text-white">
        Profile
      </h2>

    </div>
  );
};

export default Topbar;