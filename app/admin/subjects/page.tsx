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

type SubjectRow = {
  _id: string;
  name: string;
  examId: string;
  examName: string;
  topicCount: number;
};

export default function AdminSubjectsPage() {
  const subjects = useQuery(api.admin.getAllSubjectsWithCounts);
  const exams = useQuery(api.admin.getAllExamsWithCounts);
  const deleteSubject = useMutation(api.admin.deleteSubject);
  const bulkDelete = useMutation(api.admin.bulkDeleteSubjects);
  const editSubject = useMutation(api.admin.editSubject);
  const createSubject = useMutation(api.admin.createSubject);

  const [newName, setNewName] = useState("");
  const [newExamId, setNewExamId] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim() || !newExamId) {
      toast.error("Please fill all fields");
      return;
    }
    setIsCreating(true);
    try {
      await createSubject({
        name: newName,
        examId: newExamId as Id<"exams">,
      });
      toast.success("Subject created!");
      setNewName("");
    } catch {
      toast.error("Failed to create subject");
    } finally {
      setIsCreating(false);
    }
  };

  const columns = [
    { key: "name", label: "Subject Name" },
    {
      key: "examName",
      label: "Exam",
      render: (row: SubjectRow) => (
        <span className="text-zinc-400 text-xs bg-zinc-800 px-2 py-1 rounded-full">
          {row.examName}
        </span>
      ),
    },
    {
      key: "topicCount",
      label: "Topics",
      render: (row: SubjectRow) => (
        <span className="text-[#FF8D28] font-semibold">
          {row.topicCount}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8">

      {/* Create New Subject */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <h2 className="text-white font-semibold text-lg">
          Create New Subject
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            placeholder="Subject name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
          <Select value={newExamId} onValueChange={setNewExamId}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Select exam" />
            </SelectTrigger>
            <SelectContent>
              {exams?.map((exam) => (
                <SelectItem key={exam._id} value={exam._id}>
                  {exam.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleCreate}
          disabled={isCreating}
          className="bg-[#FF8D28] hover:bg-[#ff8d28d9] text-white"
        >
          {isCreating ? "Creating..." : "Create Subject"}
        </Button>
      </div>

      {/* Subjects Table */}
      <AdminTable
        title="Subjects"
        data={subjects as SubjectRow[] | undefined}
        columns={columns}
        searchPlaceholder="Search subjects..."
        onDelete={(id) => {
          deleteSubject({ subjectId: id as Id<"subjects"> });
          toast.success("Subject deleted");
        }}
        onBulkDelete={(ids) => {
          bulkDelete({ subjectIds: ids as Id<"subjects">[] });
          toast.success(`${ids.length} subjects deleted`);
        }}
        onEdit={() => {}}
        renderEditForm={(row, onClose) => (
          <EditSubjectForm
            row={row as SubjectRow}
            onClose={onClose}
            onSave={async (updated) => {
              await editSubject({
                subjectId: updated._id as Id<"subjects">,
                name: updated.name,
              });
              toast.success("Subject updated!");
              onClose();
            }}
          />
        )}
      />
    </div>
  );
}

const EditSubjectForm = ({
  row,
  onClose,
  onSave,
}: {
  row: SubjectRow;
  onClose: () => void;
  onSave: (updated: SubjectRow) => Promise<void>;
}) => {
  const [name, setName] = useState(row.name);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ ...row, name });
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="bg-zinc-800 border-zinc-700 text-white"
        placeholder="Subject name"
      />
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
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