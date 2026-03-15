/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import {
  FaBookOpen,
  FaFilePdf,
  FaUpload,
  FaPaperPlane,
} from "react-icons/fa";
import { Book } from "./aibook-types";

type Props = {
  books: Book[];
  onSelectBook: (id: string) => void;
  onUpload: (book: Book) => void;
  onSend: (text: string) => void;
  userName?: string;
};

export const AIBookHome = ({ books, onSelectBook, onUpload, onSend, userName }: Props) => {
  const [input, setInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadTitle(file.name.replace(".pdf", "").replace(/_/g, " "));
  };

  const handleUpload = () => {
    if (!uploadFile || !uploadTitle.trim()) return;
    const newBook: Book = {
      id: Date.now().toString(),
      title: uploadTitle.trim(),
      pages: 0,
      status: "indexing",
      progress: 0,
      emoji: "📗",
    };
    onUpload(newBook);
    setUploadFile(null);
    setUploadTitle("");
  };

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 bg-zinc-950 overflow-y-auto">
      <div className="w-full max-w-2xl flex flex-col items-center gap-6">

        {/* Greeting */}
        <div className="flex items-center gap-3">
          <FaBookOpen className="text-[#FF8D28] size-8" />
          <h1 className="text-4xl font-semibold text-white tracking-tight">
            {userName ? `${userName}, what are you studying?` : "What are you studying?"}
          </h1>
        </div>

        {/* Main input box */}
        <div className="flex flex-col w-full h-full bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden shadow-xl">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything from your book..."
            rows={3}
            className="w-full bg-transparent border-none text-zinc-200 placeholder:text-zinc-500 text-base resize-none px-5 pt-5 pb-3 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <div className="flex flow-row items-center justify-between px-4 pb-3 relative top-1.5">
            {/* Upload button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm"
                  className="text-zinc-500 hover:text-white hover:bg-zinc-800 gap-2 rounded-xl">
                  <FaUpload className="size-3.5" />
                  Upload book
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-zinc-900 border-zinc-700 w-96 text-white">
                <SheetHeader>
                  <SheetTitle className="text-white flex items-center gap-2">
                    <FaBookOpen className="text-[#FF8D28] size-4" />
                    Upload a Book
                  </SheetTitle>
                  <SheetDescription className="text-zinc-400 text-sm">
                    Upload a PDF and AIBook will index it so you can ask questions from it.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-5 mt-6">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-700 hover:border-[#FF8D28] rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all"
                  >
                    {uploadFile ? (
                      <>
                        <FaFilePdf className="text-[#FF8D28] size-10" />
                        <p className="text-sm font-medium text-white text-center">{uploadFile.name}</p>
                        <p className="text-xs text-zinc-500">{(uploadFile.size / 1024 / 1024).toFixed(1)} MB</p>
                      </>
                    ) : (
                      <>
                        <FaUpload className="text-zinc-500 size-8" />
                        <p className="text-sm text-zinc-400 text-center">Click to select PDF</p>
                        <p className="text-xs text-zinc-600">PDF only · Max 50MB</p>
                      </>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileSelect} />
                  <div className="flex flex-col gap-2">
                    <Label className="text-zinc-400 text-xs">Book title</Label>
                    <Input
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="e.g. NCERT Physics XII"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 text-sm"
                    />
                  </div>
                  <Card className="bg-zinc-800/60 border-zinc-700">
                    <CardContent className="p-3 space-y-1.5">
                      {["PDF text extracted and stored securely", "Indexing takes 30–60 seconds", "All answers include page references"].map((t) => (
                        <div key={t} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#FF8D28] mt-1.5 shrink-0" />
                          <p className="text-xs text-zinc-400">{t}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
                <SheetFooter className="mt-6 flex gap-2">
                  <SheetClose asChild>
                    <Button variant="outline" className="flex-1 border-zinc-700 text-zinc-400">Cancel</Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button onClick={handleUpload} disabled={!uploadFile || !uploadTitle.trim()}
                      className="flex-1 bg-[#FF8D28] hover:bg-[#ff8d28d9] text-white">
                      <FaUpload className="size-3 mr-2" /> Upload & Index
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            {/* Send button */}
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              size="sm"
              className="bg-[#FF8D28] hover:bg-[#ff8d28d9] text-white rounded-xl gap-2 px-4"
            >
              <FaPaperPlane className="size-3" />
              Ask
            </Button>
          </div>
        </div>
        {/* Library — only shown if books exist */}
        {books.filter(b => b.status === "ready").length > 0 && (
          <div className="w-full mt-2">
            <p className="text-xs text-zinc-600 mb-3 text-center">Or open a book from your library</p>
            <div className="flex flex-wrap justify-center gap-2">
              {books.filter(b => b.status === "ready").map((book) => (
                <button key={book.id} onClick={() => onSelectBook(book.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 text-xs hover:text-white hover:border-zinc-500 transition-all">
                  <span>{book.emoji}</span>
                  {book.title}
                </button>
              ))}
              {books.filter(b => b.status === "indexing").map((book) => (
                <div key={book.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-600 text-xs cursor-not-allowed">
                  <span>{book.emoji}</span>
                  {book.title}
                  <span className="text-[10px] text-zinc-700">· {book.progress}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};