"use client";

import { useScrollTop } from "@/hooks/use-scroll-top";
import { cn } from "@/lib/utils";

import { TbMenu3 } from "react-icons/tb";

import { Logo } from "@/components/logo";
import SearchMenu from "./_components/search-menu";
import ActionButton from "./_components/action-button";
import { NavigationMenuListItems } from "./_components/menu";

const Navbar = () => {
  const scrolled = useScrollTop();

  return (
    <div
      className={cn(
        "fixed top-8 z-50 w-full bg-black",
        scrolled && "border-b shadow-sm"
      )}
    >
      {/* Top Row */}
      <div className="flex items-center px-6 py-4 relative left-16">
        <TbMenu3 className="text-[#FF8D28] text-5xl mr-4" />
        {/* Left: Logo */}
        <div className="flex items-center gap-x-4">
          <Logo />
        </div>

        {/* Center: Search */}
        <div className="flex-1 flex justify-center relative right-50">
          <SearchMenu />
        </div>

        {/* Right: Action */}
        <div className="flex items-center gap-x-4 relative right-25">
          <ActionButton />
        </div>
      </div>

      {/* Bottom Row: Navigation */}
      <div className="flex justify-start relative left-18 top-5">
        <NavigationMenuListItems />
      </div>
    </div>
  );
};

export default Navbar;
