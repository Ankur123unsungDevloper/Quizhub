"use client";

import { SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"


export default function AIBookLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <TooltipProvider delayDuration={0}>
          {children}
      </TooltipProvider>
    </SidebarProvider>
  )
}