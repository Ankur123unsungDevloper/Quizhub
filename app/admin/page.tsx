"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import {
  MdMenuBook, MdOutlineSubject, MdTopic,
  MdPeople, MdAutoAwesome, MdQueryStats,
} from "react-icons/md";
import { FaDatabase } from "react-icons/fa";

const StatCard = ({
  icon, label, value, color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-zinc-400 text-sm">{label}</p>
      <p className="text-white text-2xl font-bold mt-1">{value}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const stats = useQuery(api.admin.getDashboardStats);
  const seedData = useMutation(api.admin.seedInitialData);
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const result = await seedData({});
      toast.success(result.message);
    } catch {
      toast.error("Seed failed");
    } finally {
      setSeeding(false);
    }
  };

  const debug = useQuery(api.admin.debugCounts);
  console.log("DEBUG:", debug);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-zinc-400 mt-1">Overview of your QuizHub platform</p>
        </div>

        {/* Seed Button — only shows when DB is empty */}
        {stats?.totalExams === 0 && (
          <Button
            onClick={handleSeed}
            disabled={seeding}
            className="bg-zinc-700 hover:bg-zinc-600 text-white flex items-center gap-2"
          >
            <FaDatabase className="size-4" />
            {seeding ? "Seeding..." : "Seed Initial Data"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={<MdMenuBook className="size-6 text-orange-400" />}
          label="Total Exams"
          value={stats?.totalExams ?? "—"}
          color="bg-orange-900/30"
        />
        <StatCard
          icon={<MdOutlineSubject className="size-6 text-blue-400" />}
          label="Total Subjects"
          value={stats?.totalSubjects ?? "—"}
          color="bg-blue-900/30"
        />
        <StatCard
          icon={<MdTopic className="size-6 text-purple-400" />}
          label="Total Topics"
          value={stats?.totalTopics ?? "—"}
          color="bg-purple-900/30"
        />
        <StatCard
          icon={<MdPeople className="size-6 text-green-400" />}
          label="Total Students"
          value={stats?.totalStudents ?? "—"}
          color="bg-green-900/30"
        />
        <StatCard
          icon={<MdQueryStats className="size-6 text-yellow-400" />}
          label="Total Attempts"
          value={stats?.totalAttempts ?? "—"}
          color="bg-yellow-900/30"
        />
        <StatCard
          icon={<MdAutoAwesome className="size-6 text-pink-400" />}
          label="AI Generations"
          value={stats?.aiGenerations ?? "—"}
          color="bg-pink-900/30"
        />
      </div>
    </div>
  );
}
