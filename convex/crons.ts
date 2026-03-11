import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "autonomous-ai-agent",
  { hours: 6 },
  internal.ai.agent.runAutonomousAgent,
  {}
);

export default crons;