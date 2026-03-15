"use client";

import { useRef, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { FaBookOpen, FaFilePdf, FaUpload } from "react-icons/fa";
import { Book } from "./aibook-types";

type Props = {
  trigger: React.ReactNode;
  onUpload: (book: Book) => void;
};

export const AIBookUploadSheet = ({ trigger, onUpload }: Props) => {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>

      <SheetContent side="left" className="bg-zinc-900 border-zinc-700 w-96 text-white">
        <SheetHeader>
          <SheetTitle className="text-white flex items-center gap-2">
            <FaBookOpen className="text-violet-400 size-4" />
            Upload a Book
          </SheetTitle>
          <SheetDescription className="text-zinc-400 text-sm">
            Upload a PDF textbook or notes. AIBook will read and index it so you can ask questions from it.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-5 mt-6">
          {/* File drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-700 hover:border-violet-500 rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all"
          >
            {uploadFile ? (
              <>
                <FaFilePdf className="text-violet-400 size-10" />
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
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Title input */}
          <div className="flex flex-col gap-2">
            <Label className="text-zinc-400 text-xs">Book title</Label>
            <Input
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="e.g. NCERT Physics XII"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 text-sm"
            />
          </div>

          {/* Info points */}
          <Card className="bg-zinc-800/60 border-zinc-700">
            <CardContent className="p-3 space-y-1.5">
              {[
                "PDF text is extracted and stored securely",
                "Indexing takes 30–60 seconds",
                "You can ask questions once indexed",
                "All answers include page references",
              ].map((t) => (
                <div key={t} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                  <p className="text-xs text-zinc-400">{t}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <SheetFooter className="mt-6 flex gap-2">
          <SheetClose asChild>
            <Button variant="outline" className="flex-1 border-zinc-700 text-zinc-400">
              Cancel
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button
              onClick={handleUpload}
              disabled={!uploadFile || !uploadTitle.trim()}
              className="flex-1 bg-[#FF8D28] hover:bg-violet-500 text-white"
            >
              <FaUpload className="size-3 mr-2" />
              Upload & Index
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};