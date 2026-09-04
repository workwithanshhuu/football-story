import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowLeftRight,
  ArrowUp,
  Check,
  CircleDot,
  Flag,
  Goal,
  History,
  Shield,
  Trophy,
  Undo2,
  X,
} from "lucide-react";

type Side = "home" | "away";
type Tone = "good" | "neutral" | "bad";
type Position = "GK" | "DEF" | "MID" | "ATT";
type Player = {
  number: number;
  name: string;
  position: Position;
  spot: [number, number];
  rating: number;
};
type Event = {
  id: string;
  minute: number;
  side: Side;
  kind: "goal" | "sub" | "card" | "offside" | "action";
  player: string;
  action: string;
  detail?: string;
  tone: Tone;
  undone?: boolean;
};

const teams = {
  home: { name: "Gachibowli", code: "GCB" },
  away: { name: "Kondapur", code: "KDP" },
} as const;
const initialPlayers: Record<Side, Player[]> = {
  home: [
    { number: 1, name: "Sunil", position: "GK", spot: [50, 7], rating: 6.8 },
    { number: 4, name: "Vikram", position: "DEF", spot: [73, 23], rating: 7.6 },
    { number: 5, name: "Nikhil", position: "DEF", spot: [27, 23], rating: 6.4 },
    { number: 6, name: "Imran", position: "MID", spot: [73, 37], rating: 7.1 },
    { number: 8, name: "Karan", position: "MID", spot: [27, 37], rating: 5.9 },
    { number: 9, name: "Arjun", position: "ATT", spot: [50, 42], rating: 8.3 },
  ],
  away: [
    { number: 1, name: "#1", position: "GK", spot: [50, 93], rating: 6.2 },
    { number: 3, name: "#3", position: "DEF", spot: [27, 77], rating: 5.8 },
    { number: 5, name: "#5", position: "DEF", spot: [73, 77], rating: 6 },
    { number: 6, name: "#6", position: "MID", spot: [27, 63], rating: 6.5 },
    { number: 10, name: "#10", position: "MID", spot: [73, 63], rating: 7 },
    { number: 9, name: "#9", position: "ATT", spot: [50, 58], rating: 6.1 },
  ],
};
const initialBench: Record<Side, Player[]> = {
  home: [
    { number: 11, name: "Rahul", position: "ATT", spot: [0, 0], rating: 6 },
    { number: 3, name: "Aditya", position: "DEF", spot: [0, 0], rating: 6 },
    { number: 7, name: "Dev", position: "MID", spot: [0, 0], rating: 6 },
  ],
  away: [
    { number: 14, name: "#14", position: "ATT", spot: [0, 0], rating: 6 },
    { number: 2, name: "#2", position: "DEF", spot: [0, 0], rating: 6 },
  ],
};
const actionMap: Record<Position, string[]> = {
  GK: [
    "Save",
    "Diving save",
    "Claim",
    "Punch",
    "Sweep",
    "Goal conceded",
    "Long kick",
    "Distribution",
    "Fouled",
    "Foul",
  ],
  DEF: [
    "Duel won",
    "Duel lost",
    "Aerial won",
    "Aerial lost",
    "Interception",
    "Clearance",
    "Block",
    "Dribbled past",
    "Chance created",
    "Foul",
  ],
  MID: [
    "Goal",
    "Shot on target",
    "Assist",
    "Chance created",
    "Key pass",
    "Recovery",
    "Interception",
    "Tackle won",
    "Lost the ball",
    "Foul",
  ],
  ATT: [
    "Goal",
    "Shot on target",
    "Shot off target",
    "Off the post",
    "Assist",
    "Chance created",
    "Beat his man",
    "Aerial won",
    "Lost the ball",
    "Foul",
  ],
};
const goalTypes = ["Strong foot", "Weak foot", "Header", "Volley"];
const contested = [
  "Beat his man",
  "Duel won",
  "Duel lost",
  "Dribbled past",
  "Aerial won",
  "Aerial lost",
  "Foul",
  "Fouled",
  "Tackle won",
];
const good = [
  "Goal",
  "Shot on target",
  "Assist",
  "Chance created",
  "Aerial won",
  "Duel won",
  "Tackle won",
  "Interception",
  "Clearance",
  "Block",
  "Recovery",
  "Key pass",
  "Beat his man",
  "Save",
  "Diving save",
  "Claim",
  "Punch",
  "Sweep",
  "Fouled",
];
const bad = [
  "Aerial lost",
  "Duel lost",
  "Dribbled past",
  "Lost the ball",
  "Foul",
  "Goal conceded",
  "Shot off target",
  "Off the post",
  "Offside",
  "Yellow card",
  "Red card",
];
const id = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function LoggerFrame({ readOnly = false }: { readOnly?: boolean }) {
  const [players, setPlayers] = useState(initialPlayers);
  const [bench, setBench] = useState(initialBench);
  const [score, setScore] = useState({ home: 1, away: 0 });
  const [minute, setMinute] = useState(63);
  const [selected, setSelected] = useState<{ side: Side; index: number } | null>(null);
  const [sub, setSub] = useState<{ side: Side; index: number } | null>(null);
  const [tab, setTab] = useState<"lineup" | "activity">("lineup");
  const [modal, setModal] = useState<"actions" | "goal" | "opponent" | "lifecycle" | null>(null);
  const [pendingAction, setPendingAction] = useState("");
  const [status, setStatus] = useState<"live" | "completed" | "abandoned" | "forfeited">("live");
  const [toast, setToast] = useState("");
  const [events, setEvents] = useState<Event[]>([
    {
      id: id(),
      minute: 14,
      side: "home",
      kind: "goal",
      player: "Arjun",
      action: "Goal",
      detail: "Strong foot",
      tone: "good",
    },
    {
      id: id(),
      minute: 33,
      side: "away",
      kind: "card",
      player: "#10",
      action: "Yellow card",
      tone: "bad",
    },
    {
      id: id(),
      minute: 58,
      side: "away",
      kind: "sub",
      player: "#14",
      action: "Substitution",
      detail: "#14 on for #9",
      tone: "neutral",
    },
  ]);
  const active = selected ? players[selected.side][selected.index] : null;
  const visibleEvents = events.filter((event) => !event.undone);
  const lastEvent = [...events].reverse().find((event) => !event.undone);
  const ratings = useMemo(
    () => ({ home: average(players.home), away: average(players.away) }),
    [players],
  );

  useEffect(() => {
    if (status !== "live") return;
    const timer = window.setInterval(() => setMinute((value) => value + 1), 15000);
    return () => window.clearInterval(timer);
  }, [status]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function selectPlayer(side: Side, index: number) {
    if (sub) {
      if (sub.side === side) swap(side, sub.index, index);
      return;
    }
    setSelected((current) =>
      current?.side === side && current.index === index ? null : { side, index },
    );
    setModal("actions");
  }
  function log(action: string, tone: Tone, detail?: string, kind: Event["kind"] = "action") {
    if (!active || !selected) return;
    setEvents((current) => [
      ...current,
      { id: id(), minute, side: selected.side, kind, player: active.name, action, detail, tone },
    ]);
    if (action === "Goal")
      setScore((current) => ({ ...current, [selected.side]: current[selected.side] + 1 }));
    setModal(null);
    setPendingAction("");
    setToast("Action logged");
  }
  function chooseAction(action: string) {
    if (action === "Sub out") {
      setModal(null);
      setToast("Choose a bench player, then tap who comes off");
      return;
    }
    setPendingAction(action);
    if (action === "Goal") setModal("goal");
    else if (contested.includes(action)) setModal("opponent");
    else
      log(
        action,
        good.includes(action) ? "good" : bad.includes(action) ? "bad" : "neutral",
        undefined,
        action === "Offside"
          ? "offside"
          : action.includes("card") || action.includes("Card")
            ? "card"
            : "action",
      );
  }
  function swap(side: Side, benchIndex: number, playerIndex: number) {
    const incoming = bench[side][benchIndex];
    const outgoing = players[side][playerIndex];
    setPlayers((current) => ({
      ...current,
      [side]: current[side].map((player, index) =>
        index === playerIndex ? { ...incoming, spot: player.spot } : player,
      ),
    }));
    setBench((current) => ({
      ...current,
      [side]: current[side].map((player, index) =>
        index === benchIndex ? { ...outgoing, spot: [0, 0] } : player,
      ),
    }));
    setEvents((current) => [
      ...current,
      {
        id: id(),
        minute,
        side,
        kind: "sub",
        player: incoming.name,
        action: "Substitution",
        detail: `${incoming.name} on for ${outgoing.name}`,
        tone: "neutral",
      },
    ]);
    setSub(null);
    setSelected(null);
    setToast("Substitution logged");
  }
  function undo() {
    if (!lastEvent) return;
    setEvents((current) =>
      current.map((event) => (event.id === lastEvent.id ? { ...event, undone: true } : event)),
    );
    if (lastEvent.action === "Goal")
      setScore((current) => ({
        ...current,
        [lastEvent.side]: Math.max(0, current[lastEvent.side] - 1),
      }));
    setToast("Last action undone");
  }
  function close() {
    setModal(null);
    setPendingAction("");
  }

  if (status === "completed")
    return <Scorecard score={score} events={visibleEvents} onBack={() => setStatus("live")} />;
  return (
    <main className="logger-shell min-h-screen px-2 py-3 sm:px-4">
      <div className="logger-page mx-auto max-w-[480px] overflow-hidden rounded-[24px] shadow-2xl">
        <section className="scoreboard">
          <div className="score-meta">
            <span>Turf Arena, Gachibowli · 6v6</span>
            <span className="live-pill">
              <i /> LIVE
            </span>
          </div>
          <div className="score-row">
            <ScoreSide side="home" score={score.home} setScore={setScore} readOnly={readOnly} />
            <div className="score-center">
              <div>
                <strong>{score.home}</strong>
                <span>–</span>
                <strong>{score.away}</strong>
              </div>
              <span className="minute">
                <CircleDot className="size-3" /> {minute}'
              </span>
            </div>
            <ScoreSide side="away" score={score.away} setScore={setScore} readOnly={readOnly} />
          </div>
          <div className="sync-line">
            <span className="size-2 rounded-full bg-[#1e9a5c]" /> All events synced · logging as{" "}
            <b>Host</b>
          </div>
        </section>
        <div className="logger-tabs">
          <button className={tab === "lineup" ? "active" : ""} onClick={() => setTab("lineup")}>
            Lineup
          </button>
          <button className={tab === "activity" ? "active" : ""} onClick={() => setTab("activity")}>
            Activity <b>{visibleEvents.length}</b>
          </button>
        </div>
        {tab === "lineup" ? (
          <>
            <Pitch
              side="home"
              rating={ratings.home}
              players={players}
              selected={selected}
              sub={sub}
              onSelect={readOnly ? () => undefined : selectPlayer}
            />
            <BenchArea
              bench={bench}
              sub={sub}
              onSelect={
                readOnly
                  ? () => undefined
                  : (side, index) => {
                      setSub({ side, index });
                      setSelected(null);
                    }
              }
              readOnly={readOnly}
            />
            {!readOnly && (
              <section className="mx-3 mt-3 flex items-center justify-between rounded-2xl border border-[#ded9ca] bg-[#fffdf7] p-3 shadow-sm">
                <span className="text-xs text-[#40584b]">Tap a player to log an action</span>
                <button className="undo" onClick={undo} disabled={!lastEvent}>
                  <Undo2 className="size-3.5" /> Undo
                </button>
              </section>
            )}
            {!readOnly && (
              <button
                className="mx-3 my-3 flex w-[calc(100%-1.5rem)] items-center justify-center gap-2 rounded-xl bg-[#101612] py-3 text-xs font-bold uppercase text-white"
                onClick={() => setModal("lifecycle")}
              >
                <Flag className="size-4" /> End match
              </button>
            )}
          </>
        ) : (
          <EventFeed events={visibleEvents} />
        )}
      </div>
      {modal && (
        <Modal
          modal={modal}
          active={active}
          side={selected?.side}
          players={players}
          onClose={close}
          onAction={chooseAction}
          onGoal={(detail) => log("Goal", "good", detail, "goal")}
          onOpponent={(number) =>
            log(
              pendingAction || "Action",
              bad.includes(pendingAction) ? "bad" : "good",
              number ? `vs #${number}` : undefined,
            )
          }
          onStatus={(next) => {
            setStatus(next);
            close();
            setToast(
              next === "completed"
                ? "Match completed · building the scorecard…"
                : `Match marked ${next} · ledger preserved`,
            );
          }}
        />
      )}
      {toast && (
        <div className="toast show">
          <Check className="size-4" />
          {toast}
        </div>
      )}
    </main>
  );
}

function average(players: Player[]) {
  return players.reduce((total, player) => total + player.rating, 0) / players.length;
}
function ScoreSide({
  side,
  score,
  setScore,
  readOnly,
}: {
  side: Side;
  score: number;
  setScore: React.Dispatch<React.SetStateAction<{ home: number; away: number }>>;
  readOnly: boolean;
}) {
  return (
    <div className="team-badge">
      <span className={side}>{teams[side].code}</span>
      <b>{teams[side].name}</b>
      {!readOnly && (
        <div className="score-stepper">
          <button
            aria-label={`${side} score down`}
            onClick={() =>
              setScore((current) => ({ ...current, [side]: Math.max(0, current[side] - 1) }))
            }
          >
            <ArrowDown className="size-3" />
          </button>
          <small>{score}</small>
          <button
            aria-label={`${side} score up`}
            onClick={() => setScore((current) => ({ ...current, [side]: current[side] + 1 }))}
          >
            <ArrowUp className="size-3" />
          </button>
        </div>
      )}
    </div>
  );
}
function TeamStrip({ side, rating }: { side: Side; rating: number }) {
  return (
    <div className={`team-strip ${side === "away" ? "away-strip" : ""}`}>
      <span className={`rating-badge ${rating >= 7 ? "rating-good" : "rating-mid"}`}>
        {rating.toFixed(1)}
      </span>
      <b>{teams[side].name}</b>
      <small>2-2-1</small>
    </div>
  );
}
function Pitch({
  side: _,
  rating,
  players,
  selected,
  sub,
  onSelect,
}: {
  side: Side;
  rating: number;
  players: Record<Side, Player[]>;
  selected: { side: Side; index: number } | null;
  sub: { side: Side; index: number } | null;
  onSelect: (side: Side, index: number) => void;
}) {
  return (
    <section className="pitch-card prototype-lineup">
      <TeamStrip side="home" rating={rating} />
      <div className="prototype-pitch" aria-label="Live match pitch">
        <span className="pitch-mark pitch-halfway" />
        <span className="pitch-mark pitch-centre" />
        <span className="pitch-mark pitch-box-top" />
        <span className="pitch-mark pitch-box-bottom" />
        <span className="pitch-mark pitch-six-top" />
        <span className="pitch-mark pitch-six-bottom" />
        {(["home", "away"] as Side[]).flatMap((team) =>
          players[team].map((player, index) => (
            <button
              key={`${team}-${player.number}`}
              className={`prototype-token ${team === "home" ? "kit-white" : "kit-black"} ${selected?.side === team && selected.index === index ? "is-selected" : ""} ${sub?.side === team ? "drop" : ""}`}
              style={{ left: `${player.spot[0]}%`, top: `${player.spot[1]}%` }}
              onClick={() => onSelect(team, index)}
              aria-label={`Log an action for ${player.name}`}
            >
              <span className="token-avatar">
                <b>{player.number}</b>
                <em>{player.rating.toFixed(1)}</em>
              </span>
              <small>{player.name}</small>
            </button>
          )),
        )}
      </div>
      <TeamStrip side="away" rating={6.3} />
    </section>
  );
}
function BenchArea({
  bench,
  sub,
  onSelect,
  readOnly,
}: {
  bench: Record<Side, Player[]>;
  sub: { side: Side; index: number } | null;
  onSelect: (side: Side, index: number) => void;
  readOnly: boolean;
}) {
  return (
    <section className="bench-card">
      <div className="bench-heading">
        <b>Bench</b>
        <span>
          {sub
            ? `${bench[sub.side][sub.index].name} → tap who comes off`
            : "Tap a sub, then tap who comes off"}
        </span>
      </div>
      <div className="bench-columns">
        {(["home", "away"] as Side[]).map((side) => (
          <div className="bench-column" key={side}>
            <div className="bench-team">
              <span className={`bench-swatch ${side}`} />
              {teams[side].name}
              <small>{bench[side].length}</small>
            </div>
            {bench[side].map((player, index) => (
              <button
                className={`bench-player ${sub?.side === side && sub.index === index ? "selected" : ""}`}
                key={player.number}
                onClick={() => onSelect(side, index)}
                disabled={readOnly}
              >
                <span className={`bench-avatar ${side}`}>{player.number}</span>
                <span>
                  <b>{player.name}</b>
                  <small>{player.position}</small>
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
function EventFeed({ events }: { events: Event[] }) {
  return (
    <section className="activity-feed">
      <div className="activity-heading">
        <div>
          <span>
            <History className="size-3" /> Most recent first
          </span>
          <h2>Activity</h2>
        </div>
        <em>{events.length} captured</em>
      </div>
      <div className="activity-spine">
        {events
          .slice()
          .reverse()
          .map((event) => (
            <div key={event.id} className={`activity-row ${event.side}`}>
              <div className="activity-card">
                <span className={`activity-icon ${event.kind === "goal" ? "goal" : event.tone}`}>
                  {event.kind === "goal" ? (
                    <Goal className="size-4" />
                  ) : event.kind === "sub" ? (
                    <ArrowLeftRight className="size-4" />
                  ) : (
                    <CircleDot className="size-4" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <b>{event.player}</b>
                  <small>
                    {event.action}
                    {event.detail ? ` · ${event.detail}` : ""}
                  </small>
                </span>
                <time>{event.minute}'</time>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}

function Modal({
  modal,
  active,
  side,
  players,
  onClose,
  onAction,
  onGoal,
  onOpponent,
  onStatus,
}: {
  modal: "actions" | "goal" | "opponent" | "lifecycle";
  active: Player | null;
  side?: Side;
  players: Record<Side, Player[]>;
  onClose: () => void;
  onAction: (action: string) => void;
  onGoal: (detail: string) => void;
  onOpponent: (number: number) => void;
  onStatus: (status: "completed" | "abandoned" | "forfeited") => void;
}) {
  const opponent = side === "home" ? "away" : "home";
  const title =
    modal === "actions"
      ? active?.name || "Player"
      : modal === "goal"
        ? "How did he score?"
        : modal === "opponent"
          ? "Against who?"
          : "End this match";
  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-[#101612]/35 p-3 sm:items-center"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="w-full max-w-[440px] rounded-3xl bg-[#fffdf7] p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold uppercase">{title}</h2>
            {modal === "actions" && (
              <p className="text-xs text-[#697064]">
                {active?.position} · {teams[side || "home"].name}
              </p>
            )}
          </div>
          <button className="icon-button" aria-label="Close" onClick={onClose}>
            <X className="size-4" />
          </button>
        </div>
        {modal === "actions" && active && (
          <div className="grid grid-cols-2 gap-2">
            {[...actionMap[active.position], "Offside", "Yellow card", "Red card", "Sub out"].map(
              (action) => (
                <button
                  key={action}
                  className={`modal-choice ${action === "Goal" ? "goal-action" : good.includes(action) ? "good-action" : bad.includes(action) ? "bad-action" : ""}`}
                  onClick={() => onAction(action)}
                >
                  {action}
                </button>
              ),
            )}
          </div>
        )}
        {modal === "goal" && (
          <div className="grid grid-cols-2 gap-2">
            {goalTypes.map((detail) => (
              <button
                className="modal-choice good-action"
                key={detail}
                onClick={() => onGoal(detail)}
              >
                <Goal className="size-4" />
                {detail}
              </button>
            ))}
          </div>
        )}
        {modal === "opponent" && (
          <>
            <p className="text-sm text-[#697064]">Tap a shirt number, or skip and log it anyway.</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {players[opponent].map((player) => (
                <button
                  className="modal-choice"
                  key={player.number}
                  onClick={() => onOpponent(player.number)}
                >
                  {player.number}
                </button>
              ))}
            </div>
            <button
              className="mt-3 w-full rounded-xl border border-[#ded9ca] py-3 text-xs font-bold uppercase"
              onClick={() => onOpponent(0)}
            >
              Skip — log anyway
            </button>
          </>
        )}
        {modal === "lifecycle" && (
          <div className="space-y-2">
            <p className="text-sm text-[#697064]">
              Choose what happened. The full event ledger is preserved.
            </p>
            <button className="modal-option" onClick={() => onStatus("completed")}>
              <Check className="size-5 text-[#1e9a5c]" />
              <span>
                <b>Match completed</b>
                <small>Build the detailed scorecard from tonight’s log.</small>
              </span>
            </button>
            <button className="modal-option" onClick={() => onStatus("abandoned")}>
              <Flag className="size-5 text-[#d97a24]" />
              <span>
                <b>Abandoned</b>
                <small>Events count; the result depends on time played.</small>
              </span>
            </button>
            <button className="modal-option" onClick={() => onStatus("forfeited")}>
              <X className="size-5 text-[#d93b36]" />
              <span>
                <b>Forfeited</b>
                <small>Preserve the ledger; individual stats do not accrue.</small>
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
function Scorecard({
  score,
  events,
  onBack,
}: {
  score: { home: number; away: number };
  events: Event[];
  onBack: () => void;
}) {
  return (
    <main className="logger-shell min-h-screen px-2 py-3 sm:px-4">
      <div className="logger-page mx-auto max-w-[480px] rounded-[24px] p-4 shadow-2xl">
        <header className="flex items-center gap-3">
          <button className="icon-button" aria-label="Back to match" onClick={onBack}>
            <ArrowLeftRight className="size-4" />
          </button>
          <div>
            <p className="logger-title flex items-center gap-1">
              <Trophy className="size-3" /> Detailed scorecard
            </p>
            <h1>Sunday night five</h1>
          </div>
        </header>
        <section className="mt-4 rounded-2xl bg-[#101612] p-5 text-white">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.14em] text-[#a7b9ad]">
            Final · logged by Host
          </p>
          <div className="mt-3 flex items-center justify-center gap-5 font-display text-5xl font-bold">
            <span>{score.home}</span>
            <span className="text-2xl text-[#6d7d72]">:</span>
            <span>{score.away}</span>
          </div>
          <div className="mt-3 flex justify-between text-xs text-[#c7d2ca]">
            <span>{teams.home.name}</span>
            <span>{teams.away.name}</span>
          </div>
        </section>
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#e4f4ec] p-3 text-xs text-[#0b6e3f]">
          <Check className="size-4" /> Derived from {events.length} captured events
        </div>
        <section className="logger-panel mt-4">
          <div className="panel-heading">
            <div>
              <span>
                <Shield className="size-3" /> Event ledger
              </span>
              <h2>Match actions</h2>
            </div>
          </div>
          <EventFeed events={events} />
        </section>
        <button
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#101612] py-3 text-xs font-bold uppercase text-white"
          onClick={onBack}
        >
          <Undo2 className="size-4" /> Back to match
        </button>
      </div>
    </main>
  );
}
