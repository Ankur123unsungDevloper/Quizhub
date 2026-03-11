"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AdminTable } from "../_components/admin-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { DialogFooter } from "@/components/ui/dialog";

type ExamRow = {
  _id: string;
  name: string;
  description: string;
  category: "school" | "competitive" | "college";
  subjectCount: number;
  topicCount: number;
};

const categoryColors: Record<string, string> = {
  school: "bg-blue-900/50 text-blue-300",
  college: "bg-purple-900/50 text-purple-300",
  competitive: "bg-orange-900/50 text-orange-300",
};

export default function AdminExamsPage() {
  const exams = useQuery(api.admin.getAllExamsWithCounts);
  const deleteExam = useMutation(api.admin.deleteExam);
  const bulkDelete = useMutation(api.admin.bulkDeleteExams);
  const editExam = useMutation(api.admin.editExam);
  const createExam = useMutation(api.admin.createExam);

  // Create form state
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  type CategoryType = "school" | "competitive" | "college";
  const [newCategory, setNewCategory] = useState<CategoryType>("competitive");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim() || !newDesc.trim()) {
      toast.error("Please fill all fields");
      return;
    }
    setIsCreating(true);
    try {
      await createExam({
        name: newName,
        description: newDesc,
        category: newCategory,
      });
      toast.success("Exam created!");
      setNewName("");
      setNewDesc("");
    } catch {
      toast.error("Failed to create exam");
    } finally {
      setIsCreating(false);
    }
  };

  const columns = [
    { key: "name", label: "Exam Name" },
    {
      key: "category",
      label: "Category",
      render: (row: ExamRow) => (
        <span
          className={`text-xs px-2 py-1 rounded-full capitalize ${
            categoryColors[row.category]
          }`}
        >
          {row.category}
        </span>
      ),
    },
    {
      key: "subjectCount",
      label: "Subjects",
      render: (row: ExamRow) => (
        <span className="text-[#FF8D28] font-semibold">
          {row.subjectCount}
        </span>
      ),
    },
    {
      key: "topicCount",
      label: "Topics",
      render: (row: ExamRow) => (
        <span className="text-[#FF8D28] font-semibold">
          {row.topicCount}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8">

      {/* Create New Exam */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <h2 className="text-white font-semibold text-lg">
          Create New Exam
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            placeholder="Exam name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
          <Select
            value={newCategory}
            onValueChange={(v) =>
              setNewCategory(v as "school" | "competitive" | "college")
            }
          >
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="school">School</SelectItem>
              <SelectItem value="college">College</SelectItem>
              <SelectItem value="competitive">Competitive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder="Description"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          className="bg-zinc-800 border-zinc-700 text-white"
        />
        <Button
          onClick={handleCreate}
          disabled={isCreating}
          className="bg-[#FF8D28] hover:bg-[#ff8d28d9] text-white"
        >
          {isCreating ? "Creating..." : "Create Exam"}
        </Button>
      </div>

      {/* Exams Table */}
      <AdminTable
        title="Exams"
        data={exams as ExamRow[] | undefined}
        columns={columns}
        searchPlaceholder="Search exams..."
        onDelete={(id) => {
          deleteExam({ examId: id as Id<"exams"> });
          toast.success("Exam deleted");
        }}
        onBulkDelete={(ids) => {
          bulkDelete({ examIds: ids as Id<"exams">[] });
          toast.success(`${ids.length} exams deleted`);
        }}
        onEdit={() => {}}
        renderEditForm={(row, onClose) => (
          <EditExamForm
            row={row as ExamRow}
            onClose={onClose}
            onSave={async (updated) => {
              await editExam({
                examId: updated._id as Id<"exams">,
                name: updated.name,
                description: updated.description,
                category: updated.category,
              });
              toast.success("Exam updated!");
              onClose();
            }}
          />
        )}
      />
    </div>
  );
}

// ─── Edit Form ────────────────────────────────────────────────────────────────
const EditExamForm = ({
  row,
  onClose,
  onSave,
}: {
  row: ExamRow;
  onClose: () => void;
  onSave: (updated: ExamRow) => Promise<void>;
}) => {
  const [name, setName] = useState(row.name);
  const [description, setDescription] = useState(row.description);
  const [category, setCategory] = useState(row.category);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ ...row, name, description, category });
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="bg-zinc-800 border-zinc-700 text-white"
        placeholder="Exam name"
      />
      <Input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="bg-zinc-800 border-zinc-700 text-white"
        placeholder="Description"
      />
      <Select
        value={category}
        onValueChange={(v) =>
          setCategory(v as "school" | "competitive" | "college")
        }
      >
        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="school">School</SelectItem>
          <SelectItem value="college">College</SelectItem>
          <SelectItem value="competitive">Competitive</SelectItem>
        </SelectContent>
      </Select>
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#FF8D28] hover:bg-[#ff8d28d9] text-white"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </div>
  );
};