import pitchLoggerHtml from "../../docs/pitch-logger-v9.html?raw";

function themedDocument(html: string) {
  return html;
}

export function LoggerFrame() {
  return (
    <main className="min-h-screen w-full overflow-hidden bg-background">
      <iframe
        title="Pitch logger"
        srcDoc={themedDocument(pitchLoggerHtml)}
        className="block min-h-screen w-full border-0"
      />
    </main>
  );
}
