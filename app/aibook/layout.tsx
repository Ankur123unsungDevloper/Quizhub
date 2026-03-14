"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

import { AIBookSidebar } from "./_components/aibook-sidebar"

export default function AIBookLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <TooltipProvider delayDuration={0}>
        <AIBookSidebar />
        <SidebarInset>
          {children}
        </SidebarInset>
      </TooltipProvider>
    </SidebarProvider>
  )
}