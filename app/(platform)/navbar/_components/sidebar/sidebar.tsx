"use client";

import { useState } from "react";
import { HiMenuAlt2 } from "react-icons/hi";
import { X } from "lucide-react";
import { SidebarContent } from "./_components/sidebar-content";

const Sidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="text-[#FF8D28] hover:text-[#FF8D28]/80 transition-colors"
      >
        <HiMenuAlt2 className="text-4xl" />
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`
          fixed inset-0 z-40 bg-black/60 backdrop-blur-sm
          transition-opacity duration-300
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      />

      {/* Sidebar panel */}
      <div
        className={`
          fixed top-0 left-0 z-50 h-full w-72
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 z-10 text-zinc-400 hover:text-white transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>

        <SidebarContent onClose={() => setOpen(false)} />
      </div>
    </>
  );
};

export default Sidebar;