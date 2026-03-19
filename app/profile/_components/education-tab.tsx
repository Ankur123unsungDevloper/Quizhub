"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaEdit, FaSave } from "react-icons/fa";

type EducationType = "school" | "college" | "competitive" | "";

type Props = {
  user: {
    firstName?: string | null;
    lastName?: string | null;
    primaryEmailAddress?: { emailAddress: string } | null;
  } | null | undefined;
  preferredName: string;
  setPreferredName: (v: string) => void;
  educationType: EducationType;
  setEducationType: (v: EducationType) => void;
  studentClass: string;
  setStudentClass: (v: string) => void;
  branch: string;
  setBranch: (v: string) => void;
  exam: string;
  setExam: (v: string) => void;
  targetYear: number | undefined;
  setTargetYear: (v: number | undefined) => void;
  strongSubjects: string[];
  setStrongSubjects: (v: string[]) => void;
  weakSubjects: string[];
  setWeakSubjects: (v: string[]) => void;
  studyHours: number;
  setStudyHours: (v: number) => void;
  handleSave: () => Promise<void>;
};

// Simple label + value display row
const InfoRow = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
    <span className="text-zinc-500 text-sm">{label}</span>
    <span className="text-white text-sm font-medium">
      {value || <span className="text-zinc-600 italic text-xs">Not set</span>}
    </span>
  </div>
);

// Simple select pill group
const PillSelect = ({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="flex flex-wrap gap-2">
    {options.map((o) => (
      <button
        key={o.value}
        onClick={() => onChange(o.value)}
        className={`px-4 py-2 rounded-full text-sm border transition-all ${
          value === o.value
            ? "bg-[#FF8D28]/10 border-[#FF8D28]/50 text-[#FF8D28] font-medium"
            : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
        }`}
      >
        {o.label}
        {value === o.value && " ✓"}
      </button>
    ))}
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
    setSaving(true);
    try {
      await handleSave();
      toast.success("Saved!");
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const eduLabel = {
    school: "School Student",
    college: "College Student",
    competitive: "Competitive Exam",
    "": "",
  }[educationType];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <h2 className="text-white font-semibold">Education Details</h2>
        {!isEditing ? (
          <Button
            size="sm"
            onClick={() => setIsEditing(true)}
            className="bg-zinc-800 hover:bg-zinc-700 text-white gap-1.5 h-8"
          >
            <FaEdit className="size-3" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="border-zinc-700 text-zinc-300 h-8"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              disabled={saving}
              className="bg-[#FF8D28] hover:bg-[#ff8d28d9] text-white gap-1.5 h-8"
            >
              <FaSave className="size-3" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>

      {/* ── READ MODE ─────────────────────────────────────────────────────── */}
      {!isEditing && (
        <div className="px-6 py-2">
          <InfoRow label="First Name"      value={user?.firstName ?? ""} />
          <InfoRow label="Last Name"       value={user?.lastName ?? ""} />
          <InfoRow label="Email"           value={user?.primaryEmailAddress?.emailAddress} />
          <InfoRow label="Preferred Name"  value={preferredName} />
          <InfoRow label="Education Type"  value={eduLabel} />
          {educationType === "school"      && <InfoRow label="Class"       value={studentClass ? `Class ${studentClass}` : ""} />}
          {educationType === "college"     && <InfoRow label="Branch"      value={branch} />}
          {educationType === "competitive" && <InfoRow label="Target Exam" value={exam} />}
          <InfoRow label="Target Year"     value={targetYear?.toString()} />
          <InfoRow
            label="Strong Subjects"
            value={strongSubjects.length > 0 ? strongSubjects.join(", ") : ""}
          />
          <InfoRow
            label="Weak Subjects"
            value={weakSubjects.length > 0 ? weakSubjects.join(", ") : ""}
          />
          <InfoRow label="Daily Study Hours" value={studyHours ? `${studyHours} hours` : ""} />
        </div>
      )}

      {/* ── EDIT MODE ─────────────────────────────────────────────────────── */}
      {isEditing && (
        <div className="px-6 py-5 space-y-5">

          {/* Read-only fields from Clerk */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-zinc-500 text-xs">First Name</label>
              <div className="px-3 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-400 text-sm">
                {user?.firstName || "—"}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-zinc-500 text-xs">Last Name</label>
              <div className="px-3 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-400 text-sm">
                {user?.lastName || "—"}
              </div>
            </div>
          </div>

          {/* Preferred name */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 text-xs">Preferred Name</label>
            <Input
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
              placeholder="What should we call you?"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-[#FF8D28] h-10"
            />
          </div>

          {/* Education type */}
          <div className="space-y-2">
            <label className="text-zinc-400 text-xs">Education Type</label>
            <PillSelect
              value={educationType}
              onChange={(v) => {
                setEducationType(v as EducationType);
                setStudentClass(""); setBranch(""); setExam("");
              }}
              options={[
                { label: "School",      value: "school"      },
                { label: "College",     value: "college"     },
                { label: "Competitive", value: "competitive" },
              ]}
            />
          </div>

          {/* Dynamic field */}
          {educationType === "school" && (
            <div className="space-y-2">
              <label className="text-zinc-400 text-xs">Class</label>
              <PillSelect
                value={studentClass}
                onChange={setStudentClass}
                options={["9","10","11","12"].map(c => ({ label: `Class ${c}`, value: c }))}
              />
            </div>
          )}

          {educationType === "college" && (
            <div className="space-y-2">
              <label className="text-zinc-400 text-xs">Branch</label>
              <PillSelect
                value={branch}
                onChange={setBranch}
                options={["Engineering","Medical","Computer Science","Management","Arts"]
                  .map(b => ({ label: b, value: b }))}
              />
            </div>
          )}

          {educationType === "competitive" && (
            <div className="space-y-2">
              <label className="text-zinc-400 text-xs">Target Exam</label>
              <PillSelect
                value={exam}
                onChange={setExam}
                options={["JEE","NEET","GATE","CAT","UPSC","Other"]
                  .map(e => ({ label: e, value: e }))}
              />
            </div>
          )}

          {/* Target year */}
          <div className="space-y-2">
            <label className="text-zinc-400 text-xs">Target Year</label>
            <PillSelect
              value={targetYear?.toString() ?? ""}
              onChange={(v) => setTargetYear(Number(v))}
              options={Array.from({ length: 6 }, (_, i) => {
                const y = new Date().getFullYear() + i;
                return { label: String(y), value: String(y) };
              })}
            />
          </div>

          {/* Strong subjects — simple text input */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 text-xs">
              Strong Subjects <span className="text-zinc-600">(comma separated)</span>
            </label>
            <Input
              value={strongSubjects.join(", ")}
              onChange={(e) =>
                setStrongSubjects(
                  e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                )
              }
              placeholder="e.g. Math, Physics, Chemistry"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-[#FF8D28] h-10"
            />
          </div>

          {/* Weak subjects */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 text-xs">
              Weak Subjects <span className="text-zinc-600">(comma separated)</span>
            </label>
            <Input
              value={weakSubjects.join(", ")}
              onChange={(e) =>
                setWeakSubjects(
                  e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                )
              }
              placeholder="e.g. Organic Chemistry, Calculus"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-[#FF8D28] h-10"
            />
          </div>

          {/* Study hours — simple number buttons */}
          <div className="space-y-2">
            <label className="text-zinc-400 text-xs">Daily Study Hours</label>
            <div className="flex flex-wrap gap-2">
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(h => (
                <button
                  key={h}
                  onClick={() => setStudyHours(h)}
                  className={`w-10 h-10 rounded-xl text-sm font-medium border transition-all ${
                    studyHours === h
                      ? "bg-[#FF8D28] border-[#FF8D28] text-black font-bold"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
            <p className="text-zinc-600 text-xs">{studyHours} {studyHours === 1 ? "hour" : "hours"} / day selected</p>
          </div>
        </div>
      )}
    </div>
  );
};