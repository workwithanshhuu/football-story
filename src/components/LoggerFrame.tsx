import pitchLoggerHtml from "../../docs/pitch-logger-v9.html?raw";
import matchLoggerHtml from "../../docs/match-logger.html?raw";
import { List, Map } from "lucide-react";
function themedDocument(html: string) {
  return html;
}

export function LoggerFrame({ screen }: { screen: "pitch" | "match" }) {
  const [view, setView] = useState(screen);
  const html = view === "pitch" ? pitchLoggerHtml : matchLoggerHtml;

  return (
    <main className="min-h-screen w-full overflow-hidden bg-background">
      <div className="pointer-events-auto absolute left-[calc(50%+104px)] top-[23px] z-10 flex h-6 w-[46px] items-center gap-0.5 rounded-full border border-border bg-surface/90 p-0.5 shadow-lg backdrop-blur-md">
        <button
          type="button"
          title="Pitch view"
          aria-pressed={view === "pitch"}
          onClick={() => setView("pitch")}
          className={`flex h-5 flex-1 items-center justify-center rounded-full transition-colors ${view === "pitch" ? "volt-fill" : "text-muted-foreground hover:bg-accent"}`}
        >
          <Map className="size-3" strokeWidth={2.2} />
        </button>
        <button
          type="button"
          title="List view"
          aria-pressed={view === "match"}
          onClick={() => setView("match")}
          className={`flex h-5 flex-1 items-center justify-center rounded-full transition-colors ${view === "match" ? "volt-fill" : "text-muted-foreground hover:bg-accent"}`}
        >
          <List className="size-3" strokeWidth={2.2} />
        </button>
      </div>
      <iframe
        title={view === "pitch" ? "Pitch logger" : "Match logger"}
        srcDoc={themedDocument(html)}
        className="block min-h-screen w-full border-0"
      />
    </main>
  );
}
