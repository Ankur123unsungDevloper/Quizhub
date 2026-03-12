"use client";

import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { GlobeIcon } from "lucide-react";

import Community from "./_components/community";
import Company from "./_components/company";
import Legal from "./_components/legal";
import PlatformFooter from "./_components/platform";
import Resources from "./_components/resources";
import Social from "./_components/social";
import Update from "./_components/update";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "bn", label: "Bengali" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
];

const Footer = () => {
  return (
    <div className="flex items-center justify-center w-full h-full bg-zinc-800 p-10">
      <div className="flex flex-col items-center justify-center h-full">
        <div className="flex flex-row items-center justify-center gap-x-15">
          <PlatformFooter />
          <Resources />
          <Company />
          <Legal />
          <Community />
          <Social />
        </div>
        <div className="flex flex-row items-center justify-center w-full gap-x-30">
          <div className="flex justify-start items-start w-full mt-15">
            <Update />
          </div>
          <div className="flex justify-end items-end w-full">
            {/* ✅ Fixed: GlobeIcon + placeholder inside trigger, not SelectValue */}
            <Select defaultValue="en">
              <SelectTrigger className="w-45">
                <div className="flex items-center gap-2">
                  <GlobeIcon className="size-4 text-zinc-400" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Separator className="my-10 border-zinc-700 w-full" />
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} QuizHub. All rights reserved.<br />
          Made with ❤️ for students.
        </p>
      </div>
    </div>
  );
};

export default Footer;