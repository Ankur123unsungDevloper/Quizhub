"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FaChevronLeft } from "react-icons/fa";

const Topbar = () => {
  const router = useRouter();

  return (
    <div className="flex items-center w-full bg-zinc-800 px-4 py-3 rounded-lg relative">
      
      {/* Back Button */}
      <Button asChild
        size="icon"
        onClick={() => router.back()}
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