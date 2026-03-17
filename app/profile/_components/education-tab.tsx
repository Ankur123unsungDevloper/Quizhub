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

// Simple read-only display row
const Field = ({ label, value }: { label: string; value?: string }) => (
  <div className="space-y-1.5">
    <p className="text-zinc-400 text-xs uppercase tracking-wider">{label}</p>
    <p className="text-white text-sm px-3 py-2.5 bg-zinc-800/50 rounded-lg border border-zinc-700/50 min-h-[40px] flex items-center">
      {value || <span className="text-zinc-600 italic">Not set</span>}
    </p>
  </div>
);

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
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    // Validate required field before calling mutation
    if (!educationType) {
      toast.error("Please select your education type");
      return;
    }
    setSaving(true);
    try {
      await handleSave();
      toast.success("Education details saved!");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save — check console for details");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-[#FF8D28] focus-visible:border-[#FF8D28]";
  const selectTriggerClass = "bg-zinc-800 border-zinc-700 text-white";

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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="border-zinc-700 text-zinc-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={onSave}
                disabled={saving}
                className="bg-[#FF8D28] hover:bg-[#ff8d28d9] text-white gap-2"
              >
                <FaSave className="size-3.5" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── READ-ONLY MODE ─────────────────────────────────────────────────── */}
      {!isEditing && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name" value={user?.firstName ?? ""} />
            <Field label="Last Name" value={user?.lastName ?? ""} />
          </div>
          <Field label="Email" value={user?.primaryEmailAddress?.emailAddress ?? ""} />
          <Field label="Preferred Name" value={preferredName} />
          <Field
            label="Education Type"
            value={
              educationType === "school" ? "School Student"
              : educationType === "college" ? "College Student"
              : educationType === "competitive" ? "Competitive Exam"
              : ""
            }
          />
          {educationType === "school" && <Field label="Class" value={studentClass ? `Class ${studentClass}` : ""} />}
          {educationType === "college" && <Field label="Branch" value={branch} />}
          {educationType === "competitive" && <Field label="Target Exam" value={exam} />}
          <Field label="Target Year" value={targetYear?.toString()} />
          <div className="space-y-1.5">
            <p className="text-zinc-400 text-xs uppercase tracking-wider">Strong Subjects</p>
            <div className="flex flex-wrap gap-2 px-3 py-2.5 bg-zinc-800/50 rounded-lg border border-zinc-700/50 min-h-[40px]">
              {strongSubjects.length > 0
                ? strongSubjects.map(s => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-green-900/50 text-green-300 border border-green-700/50">{s}</span>
                  ))
                : <span className="text-zinc-600 italic text-sm">Not set</span>
              }
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-zinc-400 text-xs uppercase tracking-wider">Weak Subjects</p>
            <div className="flex flex-wrap gap-2 px-3 py-2.5 bg-zinc-800/50 rounded-lg border border-zinc-700/50 min-h-[40px]">
              {weakSubjects.length > 0
                ? weakSubjects.map(s => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-red-900/50 text-red-300 border border-red-700/50">{s}</span>
                  ))
                : <span className="text-zinc-600 italic text-sm">Not set</span>
              }
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-zinc-400 text-xs uppercase tracking-wider">Daily Study Hours</p>
            <p className="text-white text-sm px-3 py-2.5 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
              {studyHours} {studyHours === 1 ? "hour" : "hours"} / day
            </p>
          </div>
        </div>
      )}

      {/* ── EDIT MODE ──────────────────────────────────────────────────────── */}
      {isEditing && (
        <div className="space-y-5">

          {/* Name — always from Clerk, never editable */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name" value={user?.firstName ?? ""} />
            <Field label="Last Name" value={user?.lastName ?? ""} />
          </div>
          <Field label="Email" value={user?.primaryEmailAddress?.emailAddress ?? ""} />

          {/* Preferred Name */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 text-xs uppercase tracking-wider">Preferred Name</label>
            <Input
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
              placeholder="What should we call you?"
              className={inputClass}
            />
          </div>

          {/* Education Type */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 text-xs uppercase tracking-wider">Education Type</label>
            <Select
              value={educationType}
              onValueChange={(v) => {
                setEducationType(v as EducationType);
                setStudentClass(""); setBranch(""); setExam("");
              }}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Select education type" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="school">School Student</SelectItem>
                <SelectItem value="college">College Student</SelectItem>
                <SelectItem value="competitive">Competitive Exam</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dynamic field */}
          {educationType === "school" && (
            <div className="space-y-1.5">
              <label className="text-zinc-400 text-xs uppercase tracking-wider">Class</label>
              <Select value={studentClass} onValueChange={setStudentClass}>
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {["9", "10", "11", "12"].map((c) => (
                    <SelectItem key={c} value={c}>Class {c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {educationType === "college" && (
            <div className="space-y-1.5">
              <label className="text-zinc-400 text-xs uppercase tracking-wider">Branch</label>
              <Select value={branch} onValueChange={setBranch}>
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {["Engineering", "Medical", "Computer Science", "Management", "Arts"].map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {educationType === "competitive" && (
            <div className="space-y-1.5">
              <label className="text-zinc-400 text-xs uppercase tracking-wider">Target Exam</label>
              <Select value={exam} onValueChange={setExam}>
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {["JEE", "NEET", "GATE", "CAT", "UPSC", "Other"].map((e) => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Target Year */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 text-xs uppercase tracking-wider">Target Year</label>
            <Select
              value={targetYear?.toString()}
              onValueChange={(v) => setTargetYear(Number(v))}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
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
            disabled={false}
            color="green"
          />

          {/* Weak Subjects */}
          <SubjectInput
            label="Weak Subjects"
            selected={weakSubjects}
            onChange={setWeakSubjects}
            options={subjectMap[educationType] ?? []}
            disabled={false}
            color="red"
          />

          {/* Study Hours */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 text-xs uppercase tracking-wider">Daily Study Hours</label>
            <div className="flex justify-center py-4">
              <CircularSlider
                value={studyHours}
                onChange={setStudyHours}
                min={1}
                max={12}
                size={180}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};