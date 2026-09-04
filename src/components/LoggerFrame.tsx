import pitchLoggerHtml from "../../docs/pitch-logger-v9.html?raw";
import matchLoggerHtml from "../../docs/match-logger.html?raw";

export function LoggerFrame({ screen }: { screen: "pitch" | "match" }) {
  return (
    <main className="min-h-screen w-full overflow-hidden bg-[#dad5c6]">
      <iframe
        title={screen === "pitch" ? "Pitch logger" : "Match logger"}
        srcDoc={screen === "pitch" ? pitchLoggerHtml : matchLoggerHtml}
        className="block min-h-screen w-full border-0"
      />
    </main>
  );
}
