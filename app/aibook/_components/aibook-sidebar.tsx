"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FaArrowLeft, FaBookOpen, FaHome } from "react-icons/fa";
import { MdNotes, MdAccountTree } from "react-icons/md";
import { Book } from "./aibook-types";

type Props = {
  books: Book[];
  activeBook: string | null;
  onSelectBook: (id: string) => void;
  onGoHome: () => void;
  onQuickAction: (prompt: string) => void;
};

export const AIBookSidebar = ({
  books,
  activeBook,
  onSelectBook,
  onGoHome,
  onQuickAction,
}: Props) => {
  const currentBook = books.find((b) => b.id === activeBook);

  return (
    <Sidebar collapsible="icon" className="border-r border-zinc-800 bg-zinc-900">
      <SidebarHeader className="border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#FF8D28] flex items-center justify-center shrink-0">
            <FaBookOpen className="text-white size-3" />
          </div>
          {/* Hidden when collapsed */}
          <span className="text-sm font-semibold text-white group-data-[collapsible=icon]:hidden">
            AIBook
          </span>
          <Badge className="ml-auto bg-[#FF8D28]/10 text-[#FF8D28] border-[#FF8D28]/20 text-[10px] group-data-[collapsible=icon]:hidden">
            {books.filter((b) => b.status === "ready").length} books
          </Badge>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Upload button — icon only when collapsed */}
        <div className="px-3 pt-3 pb-1 group-data-[collapsible=icon]:px-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-zinc-700 text-zinc-400 hover:text-white text-xs gap-2 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
            onClick={() => onGoHome()}
          >
            <FaHome className="size-3 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">AIBook Home</span>
          </Button>
        </div>

        <Separator className="bg-zinc-800 my-1" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-zinc-600 text-[10px] uppercase tracking-widest px-3 group-data-[collapsible=icon]:hidden">
            Your Library
          </SidebarGroupLabel>
          <SidebarMenu>
            {books.map((book) => (
              <SidebarMenuItem key={book.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      onClick={() => onSelectBook(book.id)}
                      isActive={activeBook === book.id}
                      disabled={book.status !== "ready"}
                      className="h-auto py-2 px-2 flex items-center gap-2.5"
                    >
                      {/* Icon — always visible */}
                      <span className="text-xl shrink-0">{book.emoji}</span>

                      {/* Text — hidden when collapsed */}
                      <div className="flex-1 min-w-0 text-left group-data-[collapsible=icon]:hidden">
                        <p className="text-xs font-medium truncate">{book.title}</p>
                        {book.status === "ready" ? (
                          <p className="text-[10px] text-zinc-500">{book.pages} pages · indexed</p>
                        ) : (
                          <div className="mt-1">
                            <Progress value={book.progress} className="h-1 bg-zinc-700 [&>div]:bg-violet-500" />
                            <p className="text-[10px] text-zinc-500 mt-0.5">indexing… {book.progress}%</p>
                          </div>
                        )}
                      </div>

                      {/* Status dot — hidden when collapsed */}
                      {book.status === "ready" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 group-data-[collapsible=icon]:hidden" />
                      )}
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  {/* Tooltip shows book title when collapsed */}
                  <TooltipContent side="right" className="bg-zinc-800 border-zinc-700 text-zinc-200 text-xs">
                    {book.title}
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <Separator className="bg-zinc-800 my-1 group-data-[collapsible=icon]:hidden" />

        {/* Active book card — hidden when collapsed */}
        {currentBook && (
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel className="text-zinc-600 text-[10px] uppercase tracking-widest px-3">
              Active Book
            </SidebarGroupLabel>
            <div className="px-3 py-2">
              <Card className="bg-zinc-800/60 border-zinc-700">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{currentBook.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{currentBook.title}</p>
                      {currentBook.chapter && (
                        <p className="text-[10px] text-zinc-500 truncate">{currentBook.chapter}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="outline"
                          className="flex-1 h-6 text-[10px] border-zinc-700 text-zinc-500 hover:text-white"
                          onClick={() => onQuickAction(`Summarize ${currentBook.title} chapter by chapter`)}>
                          <MdNotes className="size-2.5 mr-1" /> Summary
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-200 text-xs">Summarize chapters</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="outline"
                          className="flex-1 h-6 text-[10px] border-zinc-700 text-zinc-500 hover:text-white"
                          onClick={() => onQuickAction(`List all key topics covered in ${currentBook.title}`)}>
                          <MdAccountTree className="size-2.5 mr-1" /> Topics
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-200 text-xs">List all topics</TooltipContent>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>
            </div>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-zinc-800 p-3 space-y-2">
        <p className="text-[10px] text-zinc-600 text-center group-data-[collapsible=icon]:hidden">
          Answers grounded in your book · Page refs included
        </p>
        <Button
          variant="outline"
          size="sm"
          className="w-full border-zinc-700 text-zinc-400 hover:text-white text-xs gap-2 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
          onClick={() => window.history.back()}
        >
          <FaArrowLeft className="size-3 shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">Go back</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};