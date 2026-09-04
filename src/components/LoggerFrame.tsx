import pitchLoggerHtml from "../../docs/pitch-logger-v9.html?raw";
import matchLoggerHtml from "../../docs/match-logger.html?raw";
import stadium from "@/assets/stadium-night.jpg";
import { List, Map } from "lucide-react";
import { useState } from "react";

const themeOverrides = `
<style>
:root {
  --bg: #101612; --card: #18231d; --rule: rgba(233, 239, 229, .14); --rule-2: rgba(233, 239, 229, .08);
  --txt: #f4f7ef; --mute: #9eaa9d; --faint: #6f7d70;
  --paper: #101612; --paper-2: #18231d; --line: rgba(233, 239, 229, .14);
  --ink: #f4f7ef; --ink-2: #18231d; --ink-3: #223027;
  --turf: #279b61; --pitch: #279b61; --pitch-2: #1d6f47;
  --chalk: rgba(255,255,255,.34); --hi: #35c879; --ok: #35c879; --ok-soft: rgba(53,200,121,.16);
  --mid: #f5bd45; --amber: #f5bd45; --lo: #f06c61; --bad: #f06c61; --bad-soft: rgba(240,108,97,.16);
  --star: #c6ff4a; --volt: #c6ff4a; --volt-ink: #152500; --away: #ff8067;
  --mute-2: #9eaa9d; --sub-in: #35c879; --sub-out: #f06c61; --yc: #f5bd45;
}
body { background: #0b100d url("${stadium}") center / cover fixed; color: var(--txt); position: relative; }
body:before { content: ""; position: fixed; inset: 0; z-index: -1; background: linear-gradient(180deg, rgba(11,16,13,.38), rgba(11,16,13,.88)), linear-gradient(to right, rgba(233,239,229,.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(233,239,229,.045) 1px, transparent 1px); background-size: auto, 32px 32px, 32px 32px; }
.phone, .app { background: rgba(16,22,18,.82); backdrop-filter: blur(8px); }
.board { background: rgba(11,16,13,.9); }
.board:before { background: radial-gradient(120% 90% at 100% -10%, rgba(198,255,74,.12), transparent 55%); }
.board, .scoreboard, .sheetcard, .logger-panel, .pitch-card, .action-sheet { color: var(--txt); }
.live { animation: loggerLivePulse 1.8s ease-in-out infinite; }
@keyframes loggerLivePulse { 0%, 100% { opacity: 1; } 50% { opacity: .58; } }
.stbtn, .st, .pl, .ng, .bp, .ac, .skip, .team-badge.home > span { background: var(--card); color: var(--txt); }
.team-badge.away > span, .pitch-player span { background: #0b100d; }
.team-badge small, .panel-heading h2 small, .pitch-head span, .event-row small, .empty-state { color: var(--mute); }
.st { border-color: rgba(198,255,74,.3); color: var(--volt); }
.st:active { background: var(--volt); color: var(--volt-ink); }
.switch, .log { background: rgba(24,35,29,.88); }
.bar { background: rgba(16,22,18,.78); border-color: var(--rule); }
.undo { background: rgba(24,35,29,.9); border-color: rgba(233,239,229,.18); color: var(--txt); }
.pl, .ng { border-color: rgba(233,239,229,.16); box-shadow: 0 4px 16px rgba(0,0,0,.12); }
.pl.on { background: var(--pitch-2); border-color: var(--hi); }
.pl.on .nm, .pl.on .ps { color: var(--txt); }
.ng.on { background: var(--rust); border-color: var(--rust); }
.selbar { background: rgba(11,16,13,.94); border: 1px solid rgba(198,255,74,.24); }
.event-icon { background: var(--ok-soft); color: var(--ok); }
.event-icon.goal { background: var(--volt); color: var(--volt-ink); }
.tabs, .bench, .actbar, .fwrap, .msheet { background: rgba(16,22,18,.78); color: var(--txt); }
.sheetcard, .gpanel { background: rgba(24,35,29,.92); color: var(--txt); border: 1px solid var(--rule); }
.teamstrip { background: rgba(29,111,71,.94); }
.crest.h { background: var(--volt); color: var(--volt-ink); border: 0; box-shadow: 0 4px 12px rgba(198,255,74,.22); }
.crest.a { background: var(--rust); color: #fff; border: 0; box-shadow: 0 4px 12px rgba(240,108,97,.22); }
.trate { background: var(--volt); color: var(--volt-ink); }
.trate.mid { background: var(--amber); color: #3a2900; }
.bcols { background: rgba(11,16,13,.64); border-color: var(--rule); }
.bcol, .bp { background: rgba(24,35,29,.9); color: var(--txt); border-color: var(--rule); }
.bp.on { background: var(--pitch-2); border-color: var(--hi); box-shadow: 0 0 0 2px rgba(53,200,121,.18); }
.bhead, .abhead, .fcell, .pbadge, .fminb { color: var(--txt); }
.fcell { background: rgba(24,35,29,.9); }
.fcell.left { border-right-color: var(--volt); }
.fcell.right { border-left-color: var(--rust); }
.fic, .fic.goal { background: var(--ok-soft); color: var(--ok); }
.fic.card { background: var(--amber); }.fic.red { background: var(--bad); }
.gpanel, .gpanel .gtop, .gpanel .gbody { color: var(--txt); }
.gclose { background: rgba(233,239,229,.1); color: var(--txt); }
.ac, .ng, .skip, .lcopt { background: rgba(24,35,29,.92); color: var(--txt); border-color: var(--rule); }
.ac.g, .lcopt.complete .ic { background: var(--ok-soft); border-color: rgba(53,200,121,.28); color: #65e09a; }
.ac.b, .lcopt.forfeit .ic { background: var(--bad-soft); border-color: rgba(240,108,97,.28); color: #ff9b91; }
.ac.hero { background: var(--volt); color: var(--volt-ink); border-color: var(--volt); }
.ac.sub, .lcopt.abandon .ic { background: rgba(245,189,69,.18); color: var(--amber); }
.gsub, .msheet p, .sub, .bhint, .bempty, .ft2, .plbl { color: var(--mute); }
.endbtn, .endbtn svg { color: var(--mute); }
.team-badge.home > span { background: var(--volt); color: var(--volt-ink); border: 0; }
.team-badge.away > span { background: var(--rust); color: #fff; }
.team-badge b, .team-badge small { color: var(--txt); }
.team-badge small { color: var(--mute); }
.team-picker button.active.home { border-bottom-color: #9fbe55; color: #c6df84; }
.team-picker button.active.away { border-bottom-color: #c47a70; color: #e2aaa2; }
.pl.team-home { border-left: 2px solid #658d70; }
.pl.team-away { border-left: 2px solid #9c655e; }
.pl.team-home .av { background: #315d44 !important; color: #d9e6d9; }
.pl.team-away .av { background: #68413d !important; color: #f0d8d4; }
.pl.team-home.on { background: rgba(39,112,74,.24); border-color: #658d70; }
.pl.team-away.on { background: rgba(156,101,94,.18); border-color: #9c655e; }
.ng.team-home { border-color: rgba(101,141,112,.45); }
.ng.team-away { border-color: rgba(156,101,94,.45); }
.ng.team-home.on { background: #315d44; border-color: #658d70; }
.ng.team-away.on { background: #68413d; border-color: #9c655e; }
.pl .av { display: none; }
.pl { gap: 4px; }
</style>`;

function themedDocument(html: string) {
  return html.replace("</head>", `${themeOverrides}</head>`);
}

export function LoggerFrame({ screen }: { screen: "pitch" | "match" }) {
  const [view, setView] = useState(screen);
  const html = view === "pitch" ? pitchLoggerHtml : matchLoggerHtml;
  return (
    <main className="min-h-screen w-full overflow-hidden bg-[#0b100d]">
      <div className="pointer-events-auto absolute left-[calc(50%+104px)] top-[23px] z-10 flex h-6 w-[46px] items-center gap-0.5 rounded-full border border-white/15 bg-[#101612]/90 p-0.5 shadow-lg backdrop-blur-md">
        <button
          type="button"
          title="Pitch view"
          aria-pressed={view === "pitch"}
          onClick={() => setView("pitch")}
          className={`flex h-5 flex-1 items-center justify-center rounded-full transition-colors ${view === "pitch" ? "bg-[#c6ff4a] text-[#152500]" : "text-[#9eaa9d] hover:bg-white/10"}`}
        >
          <Map className="size-3" strokeWidth={2.2} />
        </button>
        <button
          type="button"
          title="List view"
          aria-pressed={view === "match"}
          onClick={() => setView("match")}
          className={`flex h-5 flex-1 items-center justify-center rounded-full transition-colors ${view === "match" ? "bg-[#c6ff4a] text-[#152500]" : "text-[#9eaa9d] hover:bg-white/10"}`}
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
