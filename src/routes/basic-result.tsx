import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, Check, CircleAlert, Minus, Plus, ShieldCheck, Trophy } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/basic-result")({
  head: () => ({
    meta: [
      { title: "Basic result entry — footArena" },
      {
        name: "description",
        content:
          "Submit a final score without creating a detailed live event ledger for a player-referee basic post-match entry.",
      },
    ],
  }),
  component: BasicResultEntryScreen,
});

type ResultMode = "decided" | "no_result" | "walkover";

function BasicResultEntryScreen() {
  const [resultMode, setResultMode] = useState<ResultMode>("decided");
  const [homeScore, setHomeScore] = useState(2);
  const [awayScore, setAwayScore] = useState(1);
  const [mvp, setMvp] = useState("Asha Kulkarni");
  const [summary, setSummary] = useState(
    "Powai Rangers edged the game with a strong finish late in the second half.",
  );
  const [submitted, setSubmitted] = useState(false);

  const resultLabel = useMemo(() => {
    if (resultMode === "no_result") return "No result";
    if (resultMode === "walkover") return "Walkover";
    return `${homeScore} - ${awayScore}`;
  }, [awayScore, homeScore, resultMode]);

  const winnerText = useMemo(() => {
    if (resultMode !== "decided") return "Basic result entry";
    if (homeScore === awayScore) return "Draw";
    return homeScore > awayScore ? "Powai Rangers win" : "Hiranandani FC win";
  }, [awayScore, homeScore, resultMode]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <AppShell className="pb-28">
      <header className="flex items-center gap-3 px-5 pt-12 pb-5">
        <Link
          to="/home"
          aria-label="Back to home"
          className="panel-2 flex size-10 items-center justify-center rounded-xl text-foreground"
        >
          <ArrowLeft className="size-4" strokeWidth={2.2} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-700 tracking-[0.15em] text-primary uppercase">
            Match result
          </p>
          <h1 className="mt-1 truncate font-display text-2xl leading-none font-700 uppercase">
            Basic post-match entry
          </h1>
        </div>
      </header>

      <main className="space-y-4 px-5">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <section className="panel rounded-3xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-700 tracking-[0.14em] text-muted-foreground uppercase">
                    Match
                  </p>
                  <h2 className="mt-1 font-display text-[28px] font-700 uppercase leading-none">
                    Powai Rangers <span className="text-muted-foreground">vs</span> Hiranandani FC
                  </h2>
                </div>
                <span className="panel-2 rounded-full px-2.5 py-1 text-[9px] font-700 tracking-[0.12em] text-primary uppercase">
                  7v7
                </span>
              </div>

              <div className="mt-4 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-3">
                <div className="flex items-start gap-3">
                  <CircleAlert className="mt-0.5 size-4 text-primary" strokeWidth={2.2} />
                  <p className="text-[12px] leading-5 text-foreground">
                    This is a basic post-match entry. It records the final result and summary only;
                    it does not create a live event ledger or pretend to be a detailed match log.
                  </p>
                </div>
              </div>
            </section>

            <section className="panel rounded-3xl p-4">
              <p className="text-[10px] font-700 tracking-[0.14em] text-muted-foreground uppercase">
                Result type
              </p>
              <div className="mt-3 grid gap-2">
                {[
                  { value: "decided", label: "Decided result" },
                  { value: "no_result", label: "No result" },
                  { value: "walkover", label: "Walkover / forfeit" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setResultMode(option.value as ResultMode)}
                    className={`rounded-2xl border px-3 py-3 text-left transition-colors ${
                      resultMode === option.value
                        ? "border-primary bg-primary/8 text-foreground"
                        : "border-border bg-transparent text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[12px] font-700 uppercase tracking-[0.12em]">
                        {option.label}
                      </span>
                      {resultMode === option.value && (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-3" strokeWidth={2.4} />
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {resultMode === "decided" && (
                <div className="mt-4 rounded-2xl border border-border bg-background/40 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-left">
                      <p className="text-[10px] font-700 tracking-[0.12em] text-muted-foreground uppercase">
                        Final score
                      </p>
                      <p className="mt-2 font-display text-[42px] font-700 uppercase leading-none">
                        {homeScore} <span className="text-muted-foreground">-</span> {awayScore}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setHomeScore((current) => Math.max(0, current - 1))}
                        className="panel-2 flex size-10 items-center justify-center rounded-xl"
                        aria-label="Decrease home score"
                      >
                        <Minus className="size-4" strokeWidth={2.3} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setHomeScore((current) => current + 1)}
                        className="panel-2 flex size-10 items-center justify-center rounded-xl"
                        aria-label="Increase home score"
                      >
                        <Plus className="size-4" strokeWidth={2.3} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                    <div>
                      <p className="text-[10px] font-700 tracking-[0.12em] text-muted-foreground uppercase">
                        Away side
                      </p>
                      <p className="mt-2 font-display text-[42px] font-700 uppercase leading-none">
                        {awayScore}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAwayScore((current) => Math.max(0, current - 1))}
                        className="panel-2 flex size-10 items-center justify-center rounded-xl"
                        aria-label="Decrease away score"
                      >
                        <Minus className="size-4" strokeWidth={2.3} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setAwayScore((current) => current + 1)}
                        className="panel-2 flex size-10 items-center justify-center rounded-xl"
                        aria-label="Increase away score"
                      >
                        <Plus className="size-4" strokeWidth={2.3} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {resultMode !== "decided" && (
                <div className="mt-4 rounded-2xl border border-border bg-background/40 p-4 text-center">
                  <p className="text-[10px] font-700 tracking-[0.14em] text-muted-foreground uppercase">
                    Result outcome
                  </p>
                  <p className="mt-2 font-display text-[32px] font-700 uppercase leading-none">
                    {resultLabel}
                  </p>
                </div>
              )}
            </section>

            <section className="panel rounded-3xl p-4">
              <div className="space-y-4">
                <label className="block">
                  <span className="text-[10px] font-700 tracking-[0.14em] text-muted-foreground uppercase">
                    Standout player
                  </span>
                  <input
                    value={mvp}
                    onChange={(event) => setMvp(event.target.value)}
                    placeholder="Optional"
                    className="mt-2 w-full rounded-2xl border border-border bg-background/30 px-3 py-3 text-[14px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] font-700 tracking-[0.14em] text-muted-foreground uppercase">
                    Match summary
                  </span>
                  <textarea
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                    rows={4}
                    className="mt-2 w-full resize-none rounded-2xl border border-border bg-background/30 px-3 py-3 text-[14px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                  />
                </label>
              </div>
            </section>

            <button
              type="submit"
              className="volt-fill flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[12px] font-700 tracking-[0.12em] uppercase active:scale-[0.99]"
            >
              <ShieldCheck className="size-4" strokeWidth={2.2} />
              Save result
            </button>
          </form>
        ) : (
          <section className="space-y-4">
            <article className="panel rounded-3xl p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[9px] font-700 tracking-[0.12em] text-primary uppercase">
                  <Trophy className="size-3.5" strokeWidth={2.2} /> Basic result
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-[9px] font-700 tracking-[0.12em] text-muted-foreground uppercase">
                  Result saved
                </span>
              </div>

              <div className="mt-4 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4">
                <p className="text-[10px] font-700 tracking-[0.14em] text-muted-foreground uppercase">
                  Final score
                </p>
                <p className="mt-2 font-display text-[48px] font-700 uppercase leading-none">
                  {resultMode === "decided" ? `${homeScore} - ${awayScore}` : resultLabel}
                </p>
                <p className="mt-2 text-[12px] font-600 text-foreground">{winnerText}</p>
              </div>

              <div className="mt-4 rounded-2xl border border-border bg-background/30 p-3">
                <p className="text-[10px] font-700 tracking-[0.14em] text-muted-foreground uppercase">
                  Match summary
                </p>
                <p className="mt-2 text-[13px] leading-6 text-foreground">{summary}</p>
                {mvp && (
                  <p className="mt-3 text-[12px] font-600 text-primary">Standout player: {mvp}</p>
                )}
              </div>

              <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-500/8 p-3">
                <p className="text-[10px] font-700 tracking-[0.14em] text-amber-700 uppercase">
                  Not a detailed logger
                </p>
                <p className="mt-2 text-[12px] leading-5 text-foreground">
                  This result only captures the final outcome and a short summary. No detailed live
                  event timeline or scorecard ledger was created for this match.
                </p>
              </div>
            </article>

            <div className="grid gap-2 sm:grid-cols-2">
              <Link
                to="/matches"
                className="panel-2 flex items-center justify-center rounded-2xl px-4 py-3 text-[12px] font-700 tracking-[0.12em] uppercase text-foreground"
              >
                Back to matches
              </Link>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="panel flex items-center justify-center rounded-2xl px-4 py-3 text-[12px] font-700 tracking-[0.12em] uppercase text-foreground"
              >
                Edit result
              </button>
            </div>
          </section>
        )}
      </main>
    </AppShell>
  );
}
