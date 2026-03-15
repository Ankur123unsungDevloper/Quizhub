"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaBookOpen, FaTrash } from "react-icons/fa";
import { MdNotes, MdOutlineAutoAwesome, MdOutlineQuiz, MdAccountTree } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Book } from "./aibook-types";

type Props = {
  currentBook: Book | undefined;
  onAction: (prompt: string) => void;
  onClearChat: () => void;
};

export const AIBookTopbar = ({
  currentBook,
  onAction,
  onClearChat 
}: Props) => (
  <div className="flex h-12 items-center gap-3 border-b border-zinc-800 bg-zinc-900/50 px-2 shrink-0">
    <SidebarTrigger className="text-zinc-500 hover:text-white" />
    <Separator orientation="vertical" className="h-5 bg-zinc-700" />

    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-white truncate">
        {currentBook?.title ?? "AIBook"}
      </p>
      <p className="text-[11px] text-zinc-500">
        Ask questions · Get answers with page references
      </p>
    </div>

    <div className="flex items-center gap-2 shrink-0">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="border-zinc-700 text-zinc-400 hover:text-white text-xs h-7 px-2.5"
            onClick={() => onAction(`Summarize the entire ${currentBook?.title} chapter by chapter`)}
          >
            <MdNotes className="size-3.5 mr-1" /> Summarize
          </Button>
        </TooltipTrigger>
        <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
          Chapter summary
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="border-zinc-700 text-zinc-400 hover:text-white text-xs h-7 px-2.5"
            onClick={() => onAction(`Generate 5 important questions from ${currentBook?.title} for exam preparation`)}
          >
            <MdOutlineQuiz className="size-3.5 mr-1" /> Key questions
          </Button>
        </TooltipTrigger>
        <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
          Important questions from book
        </TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost" className="text-zinc-500 hover:text-white h-7 w-7 p-0">
            <BsThreeDotsVertical className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-700">
          <DropdownMenuLabel className="text-zinc-500 text-xs">Actions</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem
            className="text-zinc-300 text-xs focus:bg-zinc-800 cursor-pointer"
            onClick={() => onAction(`List all chapter names and topics in ${currentBook?.title}`)}
          >
            <FaBookOpen className="size-3 mr-2" /> Table of contents
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-zinc-300 text-xs focus:bg-zinc-800 cursor-pointer"
            onClick={() => onAction(`Create a mind map of ${currentBook?.title}`)}
          >
            <MdAccountTree className="size-3 mr-2" /> Mind map
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-zinc-300 text-xs focus:bg-zinc-800 cursor-pointer"
            onClick={onClearChat}
          >
            <MdOutlineAutoAwesome className="size-3 mr-2" /> Clear chat
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem className="text-red-400 text-xs focus:bg-zinc-800 cursor-pointer">
            <FaTrash className="size-3 mr-2" /> Remove this book
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
);