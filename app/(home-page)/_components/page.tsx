"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Topbar from "./topbar";

import Image from "next/image";
import Link from "next/link";

import { BsThreeDotsVertical } from "react-icons/bs";
import { FaEye } from "react-icons/fa";
import { CgPlayListAdd } from "react-icons/cg";
import { MdPlaylistRemove } from "react-icons/md";

const exams = [
  { id: 1, name: "JEE Main", subjects: "Physics • Chemistry • Maths", questions: 3200, describe: "JEE Main is a highly competitive engineering entrance exam in India, testing students on Physics, Chemistry, and Mathematics." },
  { id: 2, name: "NEET", subjects: "Physics • Chemistry • Biology", questions: 2800, describe: "JEE Main is a highly competitive engineering entrance exam in India, testing students on Physics, Chemistry, and Mathematics." },
  { id: 3, name: "GATE", subjects: "Core Engineering Subjects", questions: 1900, describe: "JEE Main is a highly competitive engineering entrance exam in India, testing students on Physics, Chemistry, and Mathematics." },
  { id: 4, name: "UPSC Prelims", subjects: "GS • CSAT", questions: 1500, describe: "JEE Main is a highly competitive engineering entrance exam in India, testing students on Physics, Chemistry, and Mathematics." },
  { id: 5, name: "Class 12 Boards", subjects: "All Major Subjects", questions: 2400, describe: "JEE Main is a highly competitive engineering entrance exam in India, testing students on Physics, Chemistry, and Mathematics." },
  { id: 6, name: "CUET", subjects: "Domain + General Test", questions: 1800, describe: "JEE Main is a highly competitive engineering entrance exam in India, testing students on Physics, Chemistry, and Mathematics." },
  { id: 7, name: "CAT", subjects: "QA • DILR • VARC", questions: 1200, describe: "JEE Main is a highly competitive engineering entrance exam in India, testing students on Physics, Chemistry, and Mathematics." },
  { id: 8, name: "SSC CGL", subjects: "Quant • Reasoning • English", questions: 2000, describe: "JEE Main is a highly competitive engineering entrance exam in India, testing students on Physics, Chemistry, and Mathematics." },
  { id: 9, name: "Bank PO", subjects: "Reasoning • Quant • English", questions: 2100, describe: "JEE Main is a highly competitive engineering entrance exam in India, testing students on Physics, Chemistry, and Mathematics." },
  { id: 10, name: "Railway NTPC", subjects: "General Awareness + Aptitude", questions: 1600, describe: "JEE Main is a highly competitive engineering entrance exam in India, testing students on Physics, Chemistry, and Mathematics." },
  { id: 11, name: "NDA", subjects: "Maths • General Ability", questions: 1100, describe: "JEE Main is a highly competitive engineering entrance exam in India, testing students on Physics, Chemistry, and Mathematics." },
  { id: 12, name: "CLAT", subjects: "Legal • Logical • English", questions: 1300, describe: "JEE Main is a highly competitive engineering entrance exam in India, testing students on Physics, Chemistry, and Mathematics." },
];

const Homepage = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative top-20">
      <Topbar />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="hover:bg-zinc-900 p-2 rounded-xl"
          >
            <Card
              className="bg-zinc-900 border-zinc-800 hover:border-[#FF8D28] h-70 transition duration-200"
            >
              <CardContent className="space-y-3">
                <Image
                  src={`/images/${exam.id}.png`}
                  alt={exam.name}
                  width={400}
                  height={200}
                />
              </CardContent>
            </Card>
            <div className="flex flex-col items-center justify-center py-2">
              <div className="flex flex-row items-center justify-between space-x-85">
                <Link href={`/exams/${exam.id}`} className="w-full">
                  <h2 className="text-sm text-muted-foreground hover:text-white">{exam.name}</h2>
                </Link>
                <div className="flex flex-row items-center text-sm text-muted-foreground hover:text-white">
                  <FaEye />&nbsp;
                  {exam.questions}
                </div>
              </div>
              <div className="flex items-start w-full gap-x-4 mt-2">
                <div className="flex-1 text-sm text-muted-foreground leading-relaxed">
                  {exam.describe}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 hover:bg-zinc-700"
                    >
                      <BsThreeDotsVertical className="size-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="flex items-center justify-center">
                    <DropdownMenuGroup>
                      <DropdownMenuItem>Profile</DropdownMenuItem>
                      <DropdownMenuItem>
                        <CgPlayListAdd className="h-5 w-5 mr-2" />
                        Add to your list
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MdPlaylistRemove className="h-5 w-5 mr-2" />
                        Remove from your list
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Homepage;