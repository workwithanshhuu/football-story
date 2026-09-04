import { createFileRoute } from "@tanstack/react-router";
import { LoggerFrame } from "@/components/LoggerFrame";

export const Route = createFileRoute("/referee")({
  head: () => ({
    meta: [{ title: "Referee console — footArena" }],
  }),
  component: LoggerFrame,
});
