"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectTrigger, SelectContent,
  SelectItem, SelectValue,
} from "@/components/ui/select";
import { FaEdit, FaSave } from "react-icons/fa";
import { SubjectInput } from "./subject-input";
import { CircularSlider } from "./circular-slider";

type EducationType = "school" | "college" | "competitive" | "";

const subjectMap: Record<string, string[]> = {
  school: ["Math", "Physics", "Chemistry", "Biology", "English"],
  college: ["Programming", "DSA", "Database", "Operating System", "Networks"],
  competitive: ["Math", "Physics", "Chemistry", "Reasoning", "GK"],
};

const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);

type Props = {
  user: {
    firstName?: string | null;
    lastName?: string | null;
    primaryEmailAddress?: { emailAddress: string } | null;
  } | null | undefined;
  preferredName: string; setPreferredName: (v: string) => void;
  educationType: EducationType; setEducationType: (v: EducationType) => void;
  studentClass: string; setStudentClass: (v: string) => void;
  branch: string; setBranch: (v: string) => void;
  exam: string; setExam: (v: string) => void;
  targetYear: number | undefined; setTargetYear: (v: number | undefined) => void;
  strongSubjects: string[]; setStrongSubjects: (v: string[]) => void;
  weakSubjects: string[]; setWeakSubjects: (v: string[]) => void;
  studyHours: number; setStudyHours: (v: number) => void;
  handleSave: () => Promise<void>;
};

export const EducationTab = ({
  user,
  preferredName, setPreferredName,
  educationType, setEducationType,
  studentClass, setStudentClass,
  branch, setBranch,
  exam, setExam,
  targetYear, setTargetYear,
  strongSubjects, setStrongSubjects,
  weakSubjects, setWeakSubjects,
  studyHours, setStudyHours,
  handleSave,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);

  const onSave = async () => {
    try {
      await handleSave();
      toast.success("Education details saved!");
      setIsEditing(false);
    } catch {
      toast.error("Failed to save");
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Education Details</h2>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              size="sm"
              className="bg-zinc-800 hover:bg-zinc-700 text-white gap-2"
            >
              <FaEdit className="size-3.5" /> Edit
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={onSave}
                className="bg-[#FF8D28] hover:bg-[#ff8d28d9] text-white gap-2"
              >
                <FaSave className="size-3.5" /> Save
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Name Row — always readonly (from Clerk) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-zinc-400 text-sm">First Name</label>
          <Input
            value={user?.firstName ?? ""}
            readOnly
            className="bg-zinc-800 border-zinc-700 text-zinc-400 cursor-not-allowed"
          />
        </div>
        <div className="space-y-2">
          <label className="text-zinc-400 text-sm">Last Name</label>
          <Input
            value={user?.lastName ?? ""}
            readOnly
            className="bg-zinc-800 border-zinc-700 text-zinc-400 cursor-not-allowed"
          />
        </div>
      </div>

      {/* Email — always readonly */}
      <div className="space-y-2">
        <label className="text-zinc-400 text-sm">Email</label>
        <Input
          value={user?.primaryEmailAddress?.emailAddress ?? ""}
          readOnly
          className="bg-zinc-800 border-zinc-700 text-zinc-400 cursor-not-allowed"
        />
      </div>

      {/* Preferred Name — FIXED: readOnly when not editing, fully editable when editing */}
      <div className="space-y-2">
        <label className="text-zinc-400 text-sm">Preferred Name</label>
        <Input
          value={preferredName}
          readOnly={!isEditing}
          onChange={(e) => setPreferredName(e.target.value)}
          placeholder="What should we call you?"
          className={`bg-zinc-800 border-zinc-700 text-white transition-all ${
            isEditing
              ? "border-zinc-600 focus:border-[#FF8D28] focus:ring-[#FF8D28]/20"
              : "text-zinc-400 cursor-not-allowed"
          }`}
        />
      </div>

      {/* Education Type */}
      <div className="space-y-2">
        <label className="text-zinc-400 text-sm">Your Role</label>
        <Select
          value={educationType}
          disabled={!isEditing}
          onValueChange={(v) => {
            setEducationType(v as EducationType);
            setStudentClass(""); setBranch(""); setExam("");
          }}
        >
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
            <SelectValue placeholder="Select education type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="school">School Student</SelectItem>
            <SelectItem value="college">College Student</SelectItem>
            <SelectItem value="competitive">Competitive Exam</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Dynamic field */}
      {educationType === "school" && (
        <div className="space-y-2">
          <label className="text-zinc-400 text-sm">Class</label>
          <Select value={studentClass} disabled={!isEditing} onValueChange={setStudentClass}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {["9", "10", "11", "12"].map((c) => (
                <SelectItem key={c} value={c}>Class {c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {educationType === "college" && (
        <div className="space-y-2">
          <label className="text-zinc-400 text-sm">Branch</label>
          <Select value={branch} disabled={!isEditing} onValueChange={setBranch}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {["Engineering", "Medical", "Computer Science", "Management", "Arts"].map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {educationType === "competitive" && (
        <div className="space-y-2">
          <label className="text-zinc-400 text-sm">Target Exam</label>
          <Select value={exam} disabled={!isEditing} onValueChange={setExam}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Select exam" />
            </SelectTrigger>
            <SelectContent>
              {["JEE", "NEET", "GATE", "CAT", "UPSC", "Other"].map((e) => (
                <SelectItem key={e} value={e}>{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Target Year */}
      <div className="space-y-2">
        <label className="text-zinc-400 text-sm">Target Year</label>
        <Select
          value={targetYear?.toString()}
          disabled={!isEditing}
          onValueChange={(v) => setTargetYear(Number(v))}
        >
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Strong Subjects */}
      <SubjectInput
        label="Strong Subjects"
        selected={strongSubjects}
        onChange={setStrongSubjects}
        options={subjectMap[educationType] ?? []}
        disabled={!isEditing}
        color="green"
      />

      {/* Weak Subjects */}
      <SubjectInput
        label="Weak Subjects"
        selected={weakSubjects}
        onChange={setWeakSubjects}
        options={subjectMap[educationType] ?? []}
        disabled={!isEditing}
        color="red"
      />

      {/* Study Hours — FIXED: not disabled by pointer-events but by the disabled prop */}
      <div className="space-y-2">
        <label className="text-zinc-400 text-sm">Daily Study Hours</label>
        <div className="flex justify-center py-4">
          <CircularSlider
            value={studyHours}
            onChange={setStudyHours}
            min={1}
            max={12}
            disabled={!isEditing}
            size={180}
          />
        </div>
      </div>
    </div>
  );
};