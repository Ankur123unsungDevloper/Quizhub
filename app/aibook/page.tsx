"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

export default function AIBookPage() {
  return (
    <div>
      <header className="flex h-14 items-center border-b px-4">
          <SidebarTrigger />
          <h1 className="ml-3 font-semibold">AI Book</h1>
        </header>
    </div>
  );
};