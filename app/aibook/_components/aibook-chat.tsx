"use client";

import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FaBookOpen, FaPaperPlane, FaRegBookmark, FaRegCopy, FaSave } from "react-icons/fa";
import { Message, Book } from "./aibook-types";

type Props = {
  messages: Message[];
  input: string;
  isLoading: boolean;
  currentBook: Book | undefined;
  onInputChange: (val: string) => void;
  onSend: (text?: string) => void;
};

export const AIBookChat = ({
  messages,
  input,
  isLoading,
  currentBook,
  onInputChange,
  onSend,
}: Props) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <>
      {/* Messages */}
      <ScrollArea className="flex-1 px-6 py-5">
        <div className="max-w-3xl mx-auto flex flex-col gap-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "items-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-[#FF8D28] flex items-center justify-center shrink-0 mt-0.5">
                  <FaBookOpen className="text-white size-3" />
                </div>
              )}

              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[82%] ${
                msg.role === "user"
                  ? "bg-[#FF8D28] text-white rounded-br-sm"
                  : "bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-tl-sm"
              }`}>
                {msg.role === "assistant" ? (
                  <>
                    {msg.content.split("\n").map((line, i) => (
                      <p key={i} className={`text-sm text-zinc-200 ${i > 0 ? "mt-1.5" : ""}`}>
                        {line.replace(/\*\*/g, "")}
                      </p>
                    ))}
                    <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-zinc-700">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className="text-zinc-500 hover:text-zinc-300 transition-colors"
                            onClick={() => navigator.clipboard.writeText(msg.content)}
                          >
                            <FaRegCopy className="size-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-200 text-xs">
                          Copy
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
                            <FaRegBookmark className="size-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-200 text-xs">
                          Save to notes
                        </TooltipContent>
                      </Tooltip>
                      <span className="text-[10px] text-zinc-600 ml-auto">
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>

              {msg.role === "user" && (
                <Avatar className="w-7 h-7 shrink-0 mt-0.5">
                  <AvatarFallback className="bg-zinc-700 text-zinc-300 text-xs">U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-lg bg-[#FF8D28] flex items-center justify-center shrink-0">
                <FaBookOpen className="text-white size-3" />
              </div>
              <div className="bg-zinc-800 border border-zinc-700 rounded-2xl rounded-tl-sm px-4 py-3.5 flex items-center gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full text-[#FF8D28] animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
                <span className="text-xs text-zinc-500 ml-1">Reading from your book...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/50">
        <div className="max-w-3xl mx-auto">

          {/* Textarea + buttons */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Textarea
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  currentBook
                    ? `Ask anything from "${currentBook.title}"...`
                    : "Select a book first..."
                }
                disabled={!currentBook || currentBook.status !== "ready"}
                rows={2}
                className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-600 resize-none text-sm focus:border-violet-500 focus-visible:ring-violet-500/20"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => onSend()}
                disabled={!input.trim() || isLoading || !currentBook || currentBook.status !== "ready"}
                className="bg-[#FF8D28] hover:bg-violet-500 text-white px-4 h-9 gap-2"
              >
                <FaPaperPlane className="size-3" /> Ask
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-700 text-zinc-500 hover:text-white text-xs h-7 px-3"
                onClick={() => onSend("Save this answer as a study note")}
              >
                <FaSave className="size-2.5 mr-1" /> Save
              </Button>
            </div>
          </div>

          <p className="text-[10px] text-zinc-600 mt-2 text-center">
            Answers grounded in your uploaded book · Page references included · Enter to send
          </p>
        </div>
      </div>
    </>
  );
};