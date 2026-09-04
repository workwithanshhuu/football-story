import { createFileRoute } from "@tanstack/react-router";
import { LoggerFrame } from "@/components/LoggerFrame";

export const Route = createFileRoute("/player")({
  head: () => ({
    meta: [{ title: "Live match — footArena" }],
  }),
  component: () => <LoggerFrame screen="pitch" />,
});
