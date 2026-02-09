"use client";

import { useScrollTop } from "@/hooks/use-scroll-top";
import { cn } from "@/lib/utils";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

import { TbMenu3 } from "react-icons/tb";

import { Logo } from "@/components/logo";
import SearchMenu from "./_components/search-menu";
import ActionButton from "./_components/action-button";
import { NavigationMenuListItems } from "./_components/menu";
import Sidebar from "../sidebar/sidebar";


const Navbar = () => {
  const scrolled = useScrollTop();

  return (
    <div
      className={cn(
        "fixed mt-8 z-50 w-full h-auto",
        scrolled && "border-b shadow-sm"
      )}
    >
      {/* Top Row */}
      <div className="flex items-center px-6 py-4 relative left-16">
        <Sheet>
          <SheetTrigger asChild>
            <TbMenu3
              className="text-[#FF8D28] text-5xl mr-4"
            />
          </SheetTrigger>
          <SheetContent
            side="left"
            showCloseButton={false}
          >
            <Sidebar />
          </SheetContent>
        </Sheet>
        {/* Left: Logo */}
        <div className="flex items-center gap-x-4">
          <Logo />
        </div>

        {/* Center: Search */}
        <div>
          <SearchMenu />
        </div>

        {/* Right: Action */}
        <div className="flex items-center gap-x-4 relative left-150">
          <ActionButton />
        </div>
      </div>

      {/* Bottom Row: Navigation */}
      <div className="flex justify-start relative left-24 top-5">
        <NavigationMenuListItems />
      </div>
    </div>
  );
};

export default Navbar;
