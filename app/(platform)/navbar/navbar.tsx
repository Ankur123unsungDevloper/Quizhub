/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useScrollTop } from "@/hooks/use-scroll-top";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import SearchBar from "./_components/searchbar";
import ActionButton from "./_components/action-button";
import Sidebar from "./_components/sidebar/sidebar";
import { Menu } from "./_components/menu";
import { useEffect, useState } from "react";

const Navbar = () => {
  const scrolled = useScrollTop();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div
      className={cn(
        "z-50 fixed top-0 flex flex-col items-center w-full bg-zinc-900",
        scrolled && "border-b shadow-sm"
      )}
    >
      {/* Main row */}
      <div className="flex flex-row items-center justify-between w-full px-4 py-3 md:py-4 md:px-6">
        {/* Left: sidebar + logo */}
        <div className="flex flex-row items-center gap-x-3">
          <Sidebar />
          <Logo />
        </div>
        {/* Center: searchbar — hidden on mobile, shown on md+ */}
        <div className="hidden md:flex flex-1 mx-6">
          <SearchBar />
        </div>
        {/* Right: action button */}
        <ActionButton />
      </div>
      {/* Mobile searchbar — full width below main row */}
      <div className="flex md:hidden w-full px-4 pb-3">
        <SearchBar />
      </div>

      {/* Menu */}
      <Menu />
    </div>
  );
};

export default Navbar;