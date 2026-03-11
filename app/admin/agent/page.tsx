"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import {
  MdAutoAwesome,
  MdCheckCircle,
  MdError,
  MdPending,
} from "react-icons/md";
import { FaSpinner } from "react-icons/fa";

export default function AgentMonitorPage() {
  const [isTriggering, setIsTriggering] = useState(false);

  const logs = useQuery(api.admin.getAgentLogs);
  const triggerAgent = useAction(
    api.ai.agent.triggerAgentManually
  );

  const handleTrigger = async () => {
    setIsTriggering(true);
    try {
      toast.loading("AI Agent is running...");
      await triggerAgent({});
      toast.dismiss();
      toast.success("AI Agent completed successfully!");
    } catch {
      toast.dismiss();
      toast.error("Agent encountered an error. Check logs.");
    } finally {
      setIsTriggering(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === "completed")
      return <MdCheckCircle className="text-green-400 size-5" />;
    if (status === "failed")
      return <MdError className="text-red-400 size-5" />;
    return <MdPending className="text-yellow-400 size-5 animate-pulse" />;
  };

  const getStatusColor = (status: string) => {
    if (status === "completed") return "border-green-800 bg-green-950/20";
    if (status === "failed") return "border-red-800 bg-red-950/20";
    return "border-yellow-800 bg-yellow-950/20";
  };

  return (
    <div className="space-y-8 max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <MdAutoAwesome className="text-[#FF8D28]" />
            AI Agent Monitor
          </h1>
          <p className="text-zinc-400 mt-1">
            Autonomous AI runs every 6 hours automatically
          </p>
        </div>

        {/* Manual Trigger */}
        <Button
          onClick={handleTrigger}
          disabled={isTriggering}
          className="bg-[#FF8D28] hover:bg-[#ff8d28d9] text-white"
        >
          {isTriggering ? (
            <span className="flex items-center gap-2">
              <FaSpinner className="animate-spin size-4" />
              Running...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <MdAutoAwesome className="size-5" />
              Run Now
            </span>
          )}
        </Button>
      </div>

      {/* What Agent Does */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Adds missing popular exams", icon: "📚" },
          { label: "Adds missing topics to subjects", icon: "📝" },
          { label: "Generates questions for empty topics", icon: "❓" },
          { label: "Generates images for cards", icon: "🖼️" },
          { label: "Fixes low quality questions", icon: "🔧" },
          { label: "Runs every 6 hours", icon: "⏰" },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3"
          >
            <span className="text-2xl">{item.icon}</span>
            <p className="text-zinc-400 text-sm">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Agent Logs */}
      <div className="space-y-4">
        <h2 className="text-white font-semibold text-xl">Run History</h2>

        {logs === undefined ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse h-24"
              />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
            <MdAutoAwesome className="text-zinc-600 size-12 mx-auto mb-3" />
            <p className="text-zinc-400">
              No runs yet. Click &quot;Run Now&quot; to trigger the agent.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log._id}
                className={`border rounded-xl p-5 space-y-3 ${getStatusColor(log.status)}`}
              >
                {/* Log Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(log.status)}
                    <span className="text-white font-medium capitalize">
                      {log.status}
                    </span>
                  </div>
                  <span className="text-zinc-500 text-sm">
                    {new Date(log.runAt).toLocaleString()}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { label: "Exams", value: log.examsAdded },
                    { label: "Topics", value: log.topicsAdded },
                    { label: "Questions", value: log.questionsGenerated },
                    { label: "Images", value: log.imagesGenerated },
                    { label: "Fixed", value: log.issuesFixed },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-zinc-900/50 rounded-lg p-2 text-center"
                    >
                      <p className="text-[#FF8D28] font-bold">
                        {stat.value}
                      </p>
                      <p className="text-zinc-500 text-xs">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Error message */}
                {log.errorMessage && (
                  <p className="text-red-400 text-sm bg-red-950/30 px-3 py-2 rounded-lg">
                    Error: {log.errorMessage}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}