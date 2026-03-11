/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FaTrash, FaEdit, FaSearch } from "react-icons/fa";
import { MdWarning } from "react-icons/md";

type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
};

type AdminTableProps<T extends { _id: string }> = {
  title: string;
  data: T[] | undefined;
  columns: Column<T>[];
  searchPlaceholder?: string;
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onEdit: (row: T) => void;
  renderEditForm: (
    row: T,
    onClose: () => void
  ) => React.ReactNode;
};

export function AdminTable<T extends { _id: string; name: string }>({
  title,
  data,
  columns,
  searchPlaceholder = "Search...",
  onDelete,
  onBulkDelete,
  onEdit,
  renderEditForm,
}: AdminTableProps<T>) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [editTarget, setEditTarget] = useState<T | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const filtered = data?.filter((row) =>
    row.name.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === filtered.length) {
      setSelected([]);
    } else {
      setSelected(filtered.map((r) => r._id));
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        {selected.length > 0 && (
          <Button
            variant="destructive"
            onClick={() => setShowBulkConfirm(true)}
            className="flex items-center gap-2"
          >
            <FaTrash className="size-4" />
            Delete Selected ({selected.length})
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 size-4" />
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[#FF8D28]"
        />
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {data === undefined ? (
          <div className="space-y-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-14 border-b border-zinc-800 animate-pulse bg-zinc-800/30"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-zinc-400">
            No results found.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="p-4 text-left w-10">
                  <input
                    type="checkbox"
                    checked={
                      selected.length === filtered.length &&
                      filtered.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="accent-[#FF8D28]"
                  />
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key as string}
                    className="p-4 text-left text-zinc-400 text-sm font-medium"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="p-4 text-right text-zinc-400 text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row._id}
                  className={`border-b border-zinc-800 hover:bg-zinc-800/50 transition ${
                    selected.includes(row._id) ? "bg-zinc-800/30" : ""
                  }`}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selected.includes(row._id)}
                      onChange={() => toggleSelect(row._id)}
                      className="accent-[#FF8D28]"
                    />
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col.key as string}
                      className="p-4 text-sm text-zinc-300"
                    >
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key as string] ?? "")}
                    </td>
                  ))}
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditTarget(row)}
                        className="hover:bg-zinc-700 text-zinc-400 hover:text-white"
                      >
                        <FaEdit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(row)}
                        className="hover:bg-red-900/30 text-zinc-400 hover:text-red-400"
                      >
                        <FaTrash className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Total count */}
      {data && (
        <p className="text-zinc-500 text-sm">
          Showing {filtered.length} of {data.length} results
        </p>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <MdWarning className="text-red-400 size-5" />
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <p className="text-zinc-400 text-sm">
            Are you sure you want to delete{" "}
            <span className="text-white font-semibold">
              {deleteTarget?.name}
            </span>
            ? This action cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) {
                  onDelete(deleteTarget._id);
                  setDeleteTarget(null);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Modal */}
      <Dialog
        open={showBulkConfirm}
        onOpenChange={() => setShowBulkConfirm(false)}
      >
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <MdWarning className="text-red-400 size-5" />
              Confirm Bulk Delete
            </DialogTitle>
          </DialogHeader>
          <p className="text-zinc-400 text-sm">
            Are you sure you want to delete{" "}
            <span className="text-white font-semibold">
              {selected.length} items
            </span>
            ? This action cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowBulkConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onBulkDelete(selected);
                setSelected([]);
                setShowBulkConfirm(false);
              }}
            >
              Delete {selected.length} Items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog
        open={!!editTarget}
        onOpenChange={() => setEditTarget(null)}
      >
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              Edit {title.slice(0, -1)}
            </DialogTitle>
          </DialogHeader>
          {editTarget &&
            renderEditForm(editTarget, () => setEditTarget(null))}
        </DialogContent>
      </Dialog>
    </div>
  );
}