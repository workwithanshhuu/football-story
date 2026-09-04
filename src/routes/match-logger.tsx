import { createFileRoute } from "@tanstack/react-router";
import { LoggerFrame } from "@/components/LoggerFrame";

export const Route = createFileRoute("/match-logger")({
  head: () => ({
    meta: [
      { title: "Match logger — footArena" },
      { name: "description", content: "Log live match events for every player." },
    ],
  }),
  component: () => <LoggerFrame screen="match" />,
});
