"use client";

import { useScrollTop } from "@/hooks/use-scroll-top";
import { cn } from "@/lib/utils";

import { Logo } from "@/components/logo";

import SearchBar from "./_components/searchbar";
import ActionButton from "./_components/action-button";
import Sidebar from "./_components/sidebar/sidebar";
import { Menu } from "./_components/menu";

const Navbar = () => {
  const scrolled = useScrollTop();

  return (
    <div
      className={cn(
        "z-50 fixed top-0 flex flex-col items-center w-full p-4",
        scrolled && "border-b shadow-sm"
      )}
    >
      <div className="flex flex-row items-center justify-center gap-x-50 w-full">
        <div className="flex flex-row items-center justify-center gap-x-5">
          <Sidebar />
          <Logo />
        </div>
        <SearchBar />
        <ActionButton />
      </div>
      <Menu />
    </div>
  );
};

export default Navbar;