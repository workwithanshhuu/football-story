import { createFileRoute } from "@tanstack/react-router";
import { LoggerFrame } from "@/components/LoggerFrame";

export const Route = createFileRoute("/player")({
  head: () => ({
    meta: [
      { title: "Player live view — footArena" },
      {
        name: "description",
        content: "Read-only live pitch view with score, lineup, activity, and sync status.",
      },
    ],
  }),
  component: () => <LoggerFrame readOnly />,
});
