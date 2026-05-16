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

// ─── Subject lists based on education type ────────────────────────────────────
const SCHOOL_SUBJECTS: Record<string, string[]> = {
  "9":  ["Math", "Science", "Social Science", "English", "Hindi", "Sanskrit", "Computer Science"],
  "10": ["Math", "Science", "Social Science", "English", "Hindi", "Sanskrit", "Computer Science"],
  "11": ["Physics", "Chemistry", "Math", "Biology", "English", "Computer Science", "Economics", "Accountancy", "Business Studies", "History", "Geography", "Political Science"],
  "12": ["Physics", "Chemistry", "Math", "Biology", "English", "Computer Science", "Economics", "Accountancy", "Business Studies", "History", "Geography", "Political Science"],
};

const COLLEGE_SUBJECTS: Record<string, string[]> = {
  "Engineering":       ["Mathematics", "Physics", "Chemistry", "Programming", "Data Structures", "Algorithms", "DBMS", "OS", "Networks", "Electronics"],
  "Medical":           ["Anatomy", "Physiology", "Biochemistry", "Pharmacology", "Pathology", "Microbiology", "Surgery", "Medicine"],
  "Computer Science":  ["Programming", "Data Structures", "Algorithms", "DBMS", "OS", "Networks", "Machine Learning", "Web Development"],
  "Management":        ["Marketing", "Finance", "HR", "Operations", "Economics", "Accounting", "Business Law", "Statistics"],
  "Arts":              ["History", "Political Science", "Sociology", "Psychology", "Philosophy", "Literature", "Economics", "Geography"],
};

const COMPETITIVE_SUBJECTS: Record<string, string[]> = {
  "JEE":  ["Physics", "Chemistry", "Mathematics", "Organic Chemistry", "Inorganic Chemistry", "Calculus", "Algebra", "Coordinate Geometry"],
  "NEET": ["Physics", "Chemistry", "Biology", "Botany", "Zoology", "Organic Chemistry", "Inorganic Chemistry"],
  "GATE": ["Engineering Mathematics", "Aptitude", "Data Structures", "Algorithms", "OS", "DBMS", "Networks", "Theory of Computation"],
  "CAT":  ["Quantitative Aptitude", "VARC", "DILR", "Logical Reasoning", "Data Interpretation"],
  "UPSC": ["History", "Geography", "Polity", "Economy", "Science & Technology", "Environment", "Current Affairs", "Ethics"],
  "Other": ["Mathematics", "English", "Reasoning", "General Knowledge", "Current Affairs"],
};

// ─── Get subjects based on current selection ──────────────────────────────────
const getSubjects = (educationType: EducationType, studentClass: string, branch: string, exam: string): string[] => {
  if (educationType === "school" && studentClass) {
    return SCHOOL_SUBJECTS[studentClass] ?? [];
  }
  if (educationType === "college" && branch) {
    return COLLEGE_SUBJECTS[branch] ?? [];
  }
  if (educationType === "competitive" && exam) {
    return COMPETITIVE_SUBJECTS[exam] ?? [];
  }
  return [];
};

// ─── Info row for read mode ───────────────────────────────────────────────────
const InfoRow = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
    <span className="text-zinc-500 text-sm">{label}</span>
    <span className="text-white text-sm font-medium">
      {value || <span className="text-zinc-600 italic text-xs">Not set</span>}
    </span>
  </div>
);

// ─── Pill select ──────────────────────────────────────────────────────────────
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
        type="button"
        onClick={() => onChange(o.value === value ? "" : o.value)}
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

// ─── Multi select pills for subjects ─────────────────────────────────────────
const SubjectMultiSelect = ({
  subjects,
  selected,
  onChange,
  color = "orange",
}: {
  subjects: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  color?: "orange" | "blue";
}) => {
  const toggle = (subject: string) => {
    if (selected.includes(subject)) {
      onChange(selected.filter((s) => s !== subject));
    } else {
      onChange([...selected, subject]);
    }
  };

  if (subjects.length === 0) {
    return (
      <p className="text-zinc-600 text-xs italic">
        Select your education type, class/branch/exam first to see subjects
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {subjects.map((subject) => {
        const isSelected = selected.includes(subject);
        return (
          <button
            key={subject}
            type="button"
            onClick={() => toggle(subject)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
              isSelected
                ? color === "orange"
                  ? "bg-[#FF8D28]/10 border-[#FF8D28]/50 text-[#FF8D28] font-medium"
                  : "bg-blue-500/10 border-blue-500/50 text-blue-400 font-medium"
                : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
            }`}
          >
            {isSelected ? "✓ " : ""}{subject}
          </button>
        );
      })}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
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
      toast.success("Profile saved!");
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const eduLabel: Record<EducationType, string> = {
    school:      "School Student",
    college:     "College Student",
    competitive: "Competitive Exam",
    "":          "",
  };

  const availableSubjects = getSubjects(educationType, studentClass, branch, exam);

  // Conflict check — subject can't be in both
  const handleStrongChange = (subjects: string[]) => {
    setStrongSubjects(subjects);
    // Remove from weak if added to strong
    setWeakSubjects(weakSubjects.filter((s) => !subjects.includes(s)));
  };

  const handleWeakChange = (subjects: string[]) => {
    setWeakSubjects(subjects);
    // Remove from strong if added to weak
    setStrongSubjects(strongSubjects.filter((s) => !subjects.includes(s)));
  };

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

      {/* ── READ MODE ── */}
      {!isEditing && (
        <div className="px-6 py-2">
          <InfoRow label="First Name"        value={user?.firstName ?? ""} />
          <InfoRow label="Last Name"         value={user?.lastName ?? ""} />
          <InfoRow label="Email"             value={user?.primaryEmailAddress?.emailAddress} />
          <InfoRow label="Preferred Name"    value={preferredName} />
          <InfoRow label="Education Type"    value={eduLabel[educationType]} />
          {educationType === "school"      && <InfoRow label="Class"       value={studentClass ? `Class ${studentClass}` : ""} />}
          {educationType === "college"     && <InfoRow label="Branch"      value={branch} />}
          {educationType === "competitive" && <InfoRow label="Target Exam" value={exam} />}
          <InfoRow label="Target Year"       value={targetYear?.toString()} />
          <InfoRow label="Strong Subjects"   value={strongSubjects.length > 0 ? strongSubjects.join(", ") : ""} />
          <InfoRow label="Weak Subjects"     value={weakSubjects.length > 0 ? weakSubjects.join(", ") : ""} />
          <InfoRow label="Daily Study Hours" value={studyHours ? `${studyHours} hours` : ""} />
        </div>
      )}

      {/* ── EDIT MODE ── */}
      {isEditing && (
        <div className="px-6 py-5 space-y-6">

          {/* Read-only Clerk fields */}
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
            <label className="text-zinc-400 text-xs font-medium">Preferred Name</label>
            <Input
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
              placeholder="What should we call you?"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-[#FF8D28] h-10"
            />
          </div>

          {/* Education type */}
          <div className="space-y-2">
            <label className="text-zinc-400 text-xs font-medium">I am a</label>
            <PillSelect
              value={educationType}
              onChange={(v) => {
                // Only reset sub-fields if changing to a different type
                if (v !== educationType) {
                  setStudentClass("");
                  setBranch("");
                  setExam("");
                  setStrongSubjects([]);
                  setWeakSubjects([]);
                }
                setEducationType(v as EducationType);
              }}
              options={[
                { label: "🎒 School Student",      value: "school"      },
                { label: "🎓 College Student",     value: "college"     },
                { label: "🏆 Competitive Aspirant", value: "competitive" },
              ]}
            />
          </div>

          {/* School — class selector */}
          {educationType === "school" && (
            <div className="space-y-2">
              <label className="text-zinc-400 text-xs font-medium">Class</label>
              <PillSelect
                value={studentClass}
                onChange={(v) => {
                  setStudentClass(v);
                  setStrongSubjects([]);
                  setWeakSubjects([]);
                }}
                options={["9", "10", "11", "12"].map((c) => ({
                  label: `Class ${c}`,
                  value: c,
                }))}
              />
            </div>
          )}

          {/* College — branch selector */}
          {educationType === "college" && (
            <div className="space-y-2">
              <label className="text-zinc-400 text-xs font-medium">Branch / Department</label>
              <PillSelect
                value={branch}
                onChange={(v) => {
                  setBranch(v);
                  setStrongSubjects([]);
                  setWeakSubjects([]);
                }}
                options={["Engineering", "Medical", "Computer Science", "Management", "Arts"].map((b) => ({
                  label: b,
                  value: b,
                }))}
              />
            </div>
          )}

          {/* Competitive — exam selector */}
          {educationType === "competitive" && (
            <div className="space-y-2">
              <label className="text-zinc-400 text-xs font-medium">Target Exam</label>
              <PillSelect
                value={exam}
                onChange={(v) => {
                  setExam(v);
                  setStrongSubjects([]);
                  setWeakSubjects([]);
                }}
                options={["JEE", "NEET", "GATE", "CAT", "UPSC", "Other"].map((e) => ({
                  label: e,
                  value: e,
                }))}
              />
            </div>
          )}

          {/* Strong subjects — dynamic based on selection */}
          {availableSubjects.length > 0 && (
            <div className="space-y-2">
              <label className="text-zinc-400 text-xs font-medium">
                Strong Subjects
                <span className="text-zinc-600 ml-2">(tap to select)</span>
              </label>
              <SubjectMultiSelect
                subjects={availableSubjects}
                selected={strongSubjects}
                onChange={handleStrongChange}
                color="orange"
              />
              {strongSubjects.length > 0 && (
                <p className="text-[#FF8D28] text-xs">
                  Selected: {strongSubjects.join(", ")}
                </p>
              )}
            </div>
          )}

          {/* Weak subjects — dynamic based on selection */}
          {availableSubjects.length > 0 && (
            <div className="space-y-2">
              <label className="text-zinc-400 text-xs font-medium">
                Weak Subjects
                <span className="text-zinc-600 ml-2">(tap to select)</span>
              </label>
              <SubjectMultiSelect
                subjects={availableSubjects}
                selected={weakSubjects}
                onChange={handleWeakChange}
                color="blue"
              />
              {weakSubjects.length > 0 && (
                <p className="text-blue-400 text-xs">
                  Selected: {weakSubjects.join(", ")}
                </p>
              )}
            </div>
          )}

          {/* No subjects warning */}
          {availableSubjects.length === 0 && educationType && (
            <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-xl">
              <p className="text-zinc-500 text-xs">
                {educationType === "school" && "Select your class above to see subjects"}
                {educationType === "college" && "Select your branch above to see subjects"}
                {educationType === "competitive" && "Select your target exam above to see subjects"}
              </p>
            </div>
          )}

          {/* Target year */}
          <div className="space-y-2">
            <label className="text-zinc-400 text-xs font-medium">Target Year</label>
            <PillSelect
              value={targetYear?.toString() ?? ""}
              onChange={(v) => setTargetYear(v ? Number(v) : undefined)}
              options={Array.from({ length: 6 }, (_, i) => {
                const y = new Date().getFullYear() + i;
                return { label: String(y), value: String(y) };
              })}
            />
          </div>

          {/* Study hours */}
          <div className="space-y-2">
            <label className="text-zinc-400 text-xs font-medium">
              Daily Study Hours
              <span className="text-zinc-600 ml-2">
                — {studyHours} {studyHours === 1 ? "hour" : "hours"} selected
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                <button
                  key={h}
                  type="button"
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
          </div>

          {/* Save button at bottom too */}
          <div className="pt-2">
            <Button
              onClick={onSave}
              disabled={saving}
              className="w-full bg-[#FF8D28] hover:bg-[#ff8d28d9] text-white gap-2 h-11"
            >
              <FaSave className="size-4" />
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};