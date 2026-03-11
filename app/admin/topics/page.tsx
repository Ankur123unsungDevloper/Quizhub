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

type TopicRow = {
  _id: string;
  name: string;
  subjectId: string;
  subjectName: string;
  examName: string;
  difficultyWeight: number;
};

const difficultyLabel = (weight: number) => {
  if (weight <= 3) return { label: "Easy", color: "text-green-400" };
  if (weight <= 7) return { label: "Medium", color: "text-yellow-400" };
  return { label: "Hard", color: "text-red-400" };
};

export default function AdminTopicsPage() {
  const topics = useQuery(api.admin.getAllTopicsWithDetails);
  const subjects = useQuery(api.admin.getAllSubjectsWithCounts);
  const deleteTopicMutation = useMutation(api.admin.deleteTopic);
  const bulkDelete = useMutation(api.admin.bulkDeleteTopics);
  const editTopicMutation = useMutation(api.admin.editTopic);
  const createTopicMutation = useMutation(api.admin.createTopic);

  const [newName, setNewName] = useState("");
  const [newSubjectId, setNewSubjectId] = useState("");
  const [newDifficulty, setNewDifficulty] = useState("5");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim() || !newSubjectId) {
      toast.error("Please fill all fields");
      return;
    }
    setIsCreating(true);
    try {
      await createTopicMutation({
        name: newName,
        subjectId: newSubjectId as Id<"subjects">,
        difficultyWeight: Number(newDifficulty),
      });
      toast.success("Topic created!");
      setNewName("");
    } catch {
      toast.error("Failed to create topic");
    } finally {
      setIsCreating(false);
    }
  };

  const columns = [
    { key: "name", label: "Topic Name" },
    {
      key: "subjectName",
      label: "Subject",
      render: (row: TopicRow) => (
        <span className="text-zinc-400 text-xs bg-zinc-800 px-2 py-1 rounded-full">
          {row.subjectName}
        </span>
      ),
    },
    {
      key: "examName",
      label: "Exam",
      render: (row: TopicRow) => (
        <span className="text-zinc-500 text-xs">{row.examName}</span>
      ),
    },
    {
      key: "difficultyWeight",
      label: "Difficulty",
      render: (row: TopicRow) => {
        const { label, color } = difficultyLabel(row.difficultyWeight);
        return (
          <span className={`text-xs font-semibold ${color}`}>
            {label} ({row.difficultyWeight}/10)
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-8">

      {/* Create New Topic */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <h2 className="text-white font-semibold text-lg">
          Create New Topic
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            placeholder="Topic name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
          <Select value={newSubjectId} onValueChange={setNewSubjectId}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects?.map((subject) => (
                <SelectItem key={subject._id} value={subject._id}>
                  {subject.name} — {subject.examName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={newDifficulty} onValueChange={setNewDifficulty}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} — {difficultyLabel(n).label}
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
          {isCreating ? "Creating..." : "Create Topic"}
        </Button>
      </div>

      {/* Topics Table */}
      <AdminTable
        title="Topics"
        data={topics as TopicRow[] | undefined}
        columns={columns}
        searchPlaceholder="Search topics..."
        onDelete={(id) => {
          deleteTopicMutation({ topicId: id as Id<"topics"> });
          toast.success("Topic deleted");
        }}
        onBulkDelete={(ids) => {
          bulkDelete({ topicIds: ids as Id<"topics">[] });
          toast.success(`${ids.length} topics deleted`);
        }}
        onEdit={() => {}}
        renderEditForm={(row, onClose) => (
          <EditTopicForm
            row={row as TopicRow}
            onClose={onClose}
            onSave={async (updated) => {
              await editTopicMutation({
                topicId: updated._id as Id<"topics">,
                name: updated.name,
                difficultyWeight: updated.difficultyWeight,
              });
              toast.success("Topic updated!");
              onClose();
            }}
          />
        )}
      />
    </div>
  );
}

const EditTopicForm = ({
  row,
  onClose,
  onSave,
}: {
  row: TopicRow;
  onClose: () => void;
  onSave: (updated: TopicRow) => Promise<void>;
}) => {
  const [name, setName] = useState(row.name);
  const [difficulty, setDifficulty] = useState(
    String(row.difficultyWeight)
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ ...row, name, difficultyWeight: Number(difficulty) });
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="bg-zinc-800 border-zinc-700 text-white"
        placeholder="Topic name"
      />
      <Select value={difficulty} onValueChange={setDifficulty}>
        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <SelectItem key={n} value={String(n)}>
              {n} — {difficultyLabel(n).label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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