import { createFileRoute } from "@tanstack/react-router";
import { LoggerFrame } from "@/components/LoggerFrame";
export const Route = createFileRoute("/logger")({
  head: () => ({
    meta: [
      { title: "Match logger — footArena" },
      {
        name: "description",
        content: "Log a live football match from the pitch.",
      },
    ],
  }),
  component: LoggerFrame,
});
