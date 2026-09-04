import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  MapPin,
  Minus,
  Plus,
  Trophy,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  addSquadMember,
  createMatch,
  createTeam,
  listFormats,
  publishMatch,
  type Format,
} from "@/lib/api";

export const Route = createFileRoute("/host")({
  head: () => ({
    meta: [
      { title: "Host a match — footArena" },
      {
        name: "description",
        content: "Set up a football match, build both squads, and publish it for players to join.",
      },
    ],
  }),
  component: HostScreen,
});

type SquadPlayer = { name: string; phone: string; shirtNumber: number };

const fallbackFormats: Format[] = [
  { id: "", code: "5v5", playersPerSide: 5, defaultDurationMinutes: 50, defaultPeriods: 2 },
  { id: "", code: "7v7", playersPerSide: 7, defaultDurationMinutes: 60, defaultPeriods: 2 },
  { id: "", code: "11v11", playersPerSide: 11, defaultDurationMinutes: 90, defaultPeriods: 2 },
];

function HostScreen() {
  const [step, setStep] = useState(1);
  const [formats, setFormats] = useState<Format[]>(fallbackFormats);
  const [selectedFormatCode, setSelectedFormatCode] = useState("7v7");
  const [venueName, setVenueName] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState(60);
  const [periods, setPeriods] = useState(2);
  const [homeName, setHomeName] = useState("");
  const [awayName, setAwayName] = useState("");
  const [homePlayers, setHomePlayers] = useState<SquadPlayer[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<SquadPlayer[]>([]);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    listFormats()
      .then((items) => {
        if (items.length) setFormats(items);
      })
      .catch(() => undefined);
  }, []);

  const selectedFormat = useMemo(
    () => formats.find((format) => format.code === selectedFormatCode) ?? formats[1],
    [selectedFormatCode, formats],
  );

  function chooseFormat(format: Format) {
    setSelectedFormatCode(format.code);
    setDuration(format.defaultDurationMinutes);
    setPeriods(format.defaultPeriods);
  }

  function validateCurrentStep() {
    if (step === 1 && !selectedFormat) return "Choose a match format to continue.";
    if (step === 2 && (!venueName.trim() || !scheduledAt))
      return "Add a venue and start time to continue.";
    if (step === 3 && (!homeName.trim() || !awayName.trim())) return "Name both sides to continue.";
    return "";
  }

  function nextStep() {
    const message = validateCurrentStep();
    if (message) return setError(message);
    setError("");
    setStep((current) => Math.min(current + 1, 4));
  }

  function updatePlayer(
    side: "home" | "away",
    index: number,
    field: keyof SquadPlayer,
    value: string,
  ) {
    const setter = side === "home" ? setHomePlayers : setAwayPlayers;
    setter((players) =>
      players.map((player, playerIndex) =>
        playerIndex === index
          ? { ...player, [field]: field === "shirtNumber" ? Number(value) : value }
          : player,
      ),
    );
  }

  function addPlayer(side: "home" | "away") {
    const setter = side === "home" ? setHomePlayers : setAwayPlayers;
    setter((players) => [...players, { name: "", phone: "", shirtNumber: players.length + 1 }]);
  }

  function removePlayer(side: "home" | "away", index: number) {
    const setter = side === "home" ? setHomePlayers : setAwayPlayers;
    setter((players) => players.filter((_, playerIndex) => playerIndex !== index));
  }

  async function publish() {
    const accessToken = localStorage.getItem("footArena.accessToken");
    if (!accessToken) return setError("Sign in before hosting a match.");
    if (!selectedFormat?.id) return setError("The match formats are still loading. Try again.");
    if (
      homePlayers.length < selectedFormat.playersPerSide ||
      awayPlayers.length < selectedFormat.playersPerSide
    ) {
      return setError(`Add at least ${selectedFormat.playersPerSide} players to each squad.`);
    }
    if (
      homePlayers.some((player) => !player.name.trim() || !player.phone.trim()) ||
      awayPlayers.some((player) => !player.name.trim() || !player.phone.trim())
    ) {
      return setError("Every squad player needs a name and mobile number.");
    }

    setError("");
    setIsSaving(true);
    try {
      const match = await createMatch(accessToken, {
        formatId: selectedFormat.id,
        venueName: venueName.trim(),
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMinutes: duration,
        periods,
        paymentType: "free",
        currency: "INR",
        visibility: "public",
      });
      const [homeTeam, awayTeam] = await Promise.all([
        createTeam(accessToken, match.id, "home", homeName.trim()),
        createTeam(accessToken, match.id, "away", awayName.trim()),
      ]);
      await Promise.all([
        ...homePlayers.map((player) => addSquadMember(accessToken, match.id, homeTeam.id, player)),
        ...awayPlayers.map((player) => addSquadMember(accessToken, match.id, awayTeam.id, player)),
      ]);
      await publishMatch(accessToken, match.id);
      window.location.href = "/home";
    } catch {
      setError("We could not publish this match. Check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell className="pb-8">
      <header className="flex items-center gap-3 px-5 pt-12 pb-5">
        <Link
          to="/home"
          aria-label="Back to home"
          className="panel-2 flex size-10 items-center justify-center rounded-xl"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <p className="text-[10px] font-700 tracking-[0.15em] text-primary uppercase">
            Host a match
          </p>
          <h1 className="font-display text-2xl font-700 uppercase">Make it happen.</h1>
        </div>
      </header>

      <main className="space-y-5 px-5">
        <div className="grid grid-cols-4 gap-1.5" aria-label="Setup progress">
          {["Format", "When", "Sides", "Squads"].map((label, index) => {
            const number = index + 1;
            return (
              <button
                key={label}
                type="button"
                onClick={() => number < step && setStep(number)}
                className={`flex items-center gap-1.5 text-left text-[10px] font-700 uppercase ${number <= step ? "text-primary" : "text-muted-foreground"}`}
              >
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] ${number < step ? "volt-fill" : number === step ? "bg-primary text-primary-foreground" : "panel-2"}`}
                >
                  {number < step ? <Check className="size-3" /> : number}
                </span>
                <span className="hidden min-[380px]:inline">{label}</span>
              </button>
            );
          })}
        </div>

        <section className="panel rounded-3xl p-5">
          {step === 1 && (
            <FormatStep
              formats={formats}
              selectedCode={selectedFormatCode}
              onSelect={chooseFormat}
            />
          )}
          {step === 2 && (
            <TimingStep
              venueName={venueName}
              setVenueName={setVenueName}
              scheduledAt={scheduledAt}
              setScheduledAt={setScheduledAt}
              duration={duration}
              setDuration={setDuration}
              periods={periods}
              setPeriods={setPeriods}
            />
          )}
          {step === 3 && (
            <SidesStep
              homeName={homeName}
              setHomeName={setHomeName}
              awayName={awayName}
              setAwayName={setAwayName}
            />
          )}
          {step === 4 && (
            <SquadsStep
              format={selectedFormat}
              homeName={homeName}
              awayName={awayName}
              homePlayers={homePlayers}
              awayPlayers={awayPlayers}
              updatePlayer={updatePlayer}
              addPlayer={addPlayer}
              removePlayer={removePlayer}
            />
          )}

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive"
            >
              {error}
            </p>
          )}

          <div className="mt-6 flex gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep((current) => current - 1);
                }}
                className="panel-2 flex h-12 items-center justify-center rounded-2xl px-4 text-sm font-700"
              >
                Back
              </button>
            )}
            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="volt-fill flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-700 uppercase"
              >
                Continue <ArrowRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSaving}
                onClick={publish}
                className="volt-fill flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-700 uppercase disabled:opacity-60"
              >
                {isSaving ? "Publishing..." : "Publish match"} <Check className="size-4" />
              </button>
            )}
          </div>
        </section>
      </main>
    </AppShell>
  );
}

function FormatStep({
  formats,
  selectedCode,
  onSelect,
}: {
  formats: Format[];
  selectedCode: string;
  onSelect: (format: Format) => void;
}) {
  return (
    <div className="space-y-4">
      <StepHeading
        icon={<Trophy className="size-5" />}
        eyebrow="Step 1 of 4"
        title="What are we playing?"
        detail="Pick a format and we will set sensible match defaults."
      />
      <div className="grid gap-2">
        {formats.map((format) => (
          <button
            type="button"
            key={format.code}
            onClick={() => onSelect(format)}
            className={`flex items-center justify-between rounded-2xl border p-4 text-left ${selectedCode === format.code ? "border-primary bg-primary/10" : "panel-2"}`}
          >
            <span>
              <span className="font-display text-2xl font-700">{format.code}</span>
              <span className="mt-1 block text-[11px] text-muted-foreground">
                {format.playersPerSide} players per side · {format.defaultDurationMinutes} min
              </span>
            </span>
            <span
              className={`flex size-5 items-center justify-center rounded-full border ${selectedCode === format.code ? "border-primary bg-primary" : "border-border"}`}
            >
              {selectedCode === format.code && <Check className="size-3 text-primary-foreground" />}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TimingStep({
  venueName,
  setVenueName,
  scheduledAt,
  setScheduledAt,
  duration,
  setDuration,
  periods,
  setPeriods,
}: {
  venueName: string;
  setVenueName: (value: string) => void;
  scheduledAt: string;
  setScheduledAt: (value: string) => void;
  duration: number;
  setDuration: (value: number) => void;
  periods: number;
  setPeriods: (value: number) => void;
}) {
  return (
    <div className="space-y-4">
      <StepHeading
        icon={<Clock3 className="size-5" />}
        eyebrow="Step 2 of 4"
        title="Where and when?"
        detail="Players need a clear kickoff and a dependable place."
      />
      <label className="panel-2 block rounded-2xl px-4 py-3">
        <span className="text-[10px] font-700 tracking-[0.14em] text-muted-foreground uppercase">
          Venue
        </span>
        <span className="mt-2 flex items-center gap-2">
          <MapPin className="size-4 text-primary" />
          <input
            required
            value={venueName}
            onChange={(event) => setVenueName(event.target.value)}
            placeholder="Ground or turf name"
            className="w-full bg-transparent text-sm outline-none"
          />
        </span>
      </label>
      <label className="panel-2 block rounded-2xl px-4 py-3">
        <span className="text-[10px] font-700 tracking-[0.14em] text-muted-foreground uppercase">
          Kickoff
        </span>
        <input
          required
          type="datetime-local"
          value={scheduledAt}
          onChange={(event) => setScheduledAt(event.target.value)}
          className="mt-2 w-full bg-transparent text-sm outline-none"
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <NumberControl label="Minutes" value={duration} min={10} max={180} onChange={setDuration} />
        <NumberControl label="Periods" value={periods} min={1} max={4} onChange={setPeriods} />
      </div>
    </div>
  );
}

function SidesStep({
  homeName,
  setHomeName,
  awayName,
  setAwayName,
}: {
  homeName: string;
  setHomeName: (value: string) => void;
  awayName: string;
  setAwayName: (value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <StepHeading
        icon={<Users className="size-5" />}
        eyebrow="Step 3 of 4"
        title="Name both sides."
        detail="These names will appear on the match page and scorecard."
      />
      <TeamField
        label="Home side"
        value={homeName}
        onChange={setHomeName}
        placeholder="e.g. Powai Rangers"
      />
      <TeamField
        label="Away side"
        value={awayName}
        onChange={setAwayName}
        placeholder="e.g. Hiranandani FC"
      />
    </div>
  );
}

function SquadsStep({
  format,
  homeName,
  awayName,
  homePlayers,
  awayPlayers,
  updatePlayer,
  addPlayer,
  removePlayer,
}: {
  format?: Format;
  homeName: string;
  awayName: string;
  homePlayers: SquadPlayer[];
  awayPlayers: SquadPlayer[];
  updatePlayer: (
    side: "home" | "away",
    index: number,
    field: keyof SquadPlayer,
    value: string,
  ) => void;
  addPlayer: (side: "home" | "away") => void;
  removePlayer: (side: "home" | "away", index: number) => void;
}) {
  return (
    <div className="space-y-5">
      <StepHeading
        icon={<Users className="size-5" />}
        eyebrow="Step 4 of 4"
        title="Build the squads."
        detail={`Add ${format?.playersPerSide ?? 0} players per side. Numbers are unique within each squad.`}
      />
      <SquadEditor
        side="home"
        title={homeName || "Home side"}
        players={homePlayers}
        updatePlayer={updatePlayer}
        addPlayer={addPlayer}
        removePlayer={removePlayer}
      />
      <SquadEditor
        side="away"
        title={awayName || "Away side"}
        players={awayPlayers}
        updatePlayer={updatePlayer}
        addPlayer={addPlayer}
        removePlayer={removePlayer}
      />
    </div>
  );
}

function SquadEditor({
  side,
  title,
  players,
  updatePlayer,
  addPlayer,
  removePlayer,
}: {
  side: "home" | "away";
  title: string;
  players: SquadPlayer[];
  updatePlayer: (
    side: "home" | "away",
    index: number,
    field: keyof SquadPlayer,
    value: string,
  ) => void;
  addPlayer: (side: "home" | "away") => void;
  removePlayer: (side: "home" | "away", index: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-700 uppercase">{title}</h3>
        <span className="text-[10px] text-muted-foreground">{players.length} added</span>
      </div>
      {players.map((player, index) => (
        <div
          key={`${side}-${index}`}
          className="grid grid-cols-[2.5rem_1fr_1fr_2rem] items-center gap-1.5"
        >
          <span className="panel-2 flex size-9 items-center justify-center rounded-lg text-xs font-700">
            {player.shirtNumber}
          </span>
          <input
            aria-label={`${title} player ${index + 1} name`}
            value={player.name}
            onChange={(event) => updatePlayer(side, index, "name", event.target.value)}
            placeholder="Player name"
            className="panel-2 min-w-0 rounded-lg px-2 py-2 text-xs outline-none"
          />
          <input
            aria-label={`${title} player ${index + 1} phone`}
            value={player.phone}
            onChange={(event) => updatePlayer(side, index, "phone", event.target.value)}
            placeholder="Mobile number"
            className="panel-2 min-w-0 rounded-lg px-2 py-2 text-xs outline-none"
          />
          <button
            type="button"
            aria-label={`Remove ${player.name || "player"}`}
            onClick={() => removePlayer(side, index)}
            className="flex size-8 items-center justify-center text-muted-foreground"
          >
            <Minus className="size-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => addPlayer(side)}
        className="panel-2 flex h-10 w-full items-center justify-center gap-1 rounded-xl text-xs font-700 uppercase"
      >
        <Plus className="size-3.5" /> Add player
      </button>
    </div>
  );
}

function StepHeading({
  icon,
  eyebrow,
  title,
  detail,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="text-[10px] font-700 tracking-[0.14em] uppercase">{eyebrow}</span>
      </div>
      <h2 className="font-display text-3xl font-700 uppercase">{title}</h2>
      <p className="text-xs leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function TeamField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="panel-2 block rounded-2xl px-4 py-3">
      <span className="text-[10px] font-700 tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </span>
      <input
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full bg-transparent font-display text-xl outline-none placeholder:text-muted-foreground/60"
      />
    </label>
  );
}

function NumberControl({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="panel-2 rounded-2xl px-4 py-3">
      <span className="text-[10px] font-700 tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </span>
      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="flex size-8 items-center justify-center rounded-lg bg-background disabled:opacity-40"
        >
          <Minus className="size-3.5" />
        </button>
        <span className="tnum font-display text-xl font-700">{value}</span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className="flex size-8 items-center justify-center rounded-lg bg-background disabled:opacity-40"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
