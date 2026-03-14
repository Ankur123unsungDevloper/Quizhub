"use client"

import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

import { BookOpen, Brain, LayoutDashboard } from "lucide-react"

export function AIBookSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>

        <SidebarGroup>
          <SidebarGroupLabel>AI Book</SidebarGroupLabel>

          <SidebarMenu>

            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Overview">
                <Link href="/aibook">
                  <LayoutDashboard />
                  <span>Overview</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Topics">
                <Link href="/aibook/topics">
                  <BookOpen />
                  <span>Topics</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Practice">
                <Link href="/aibook/practice">
                  <Brain />
                  <span>Practice</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

          </SidebarMenu>

        </SidebarGroup>

      </SidebarContent>
    </Sidebar>
  )
}