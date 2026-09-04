import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Compass,
  Home,
  MapPin,
  Plus,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { listMatches, type Match } from "@/lib/api";

export const Route = createFileRoute("/matches")({
  head: () => ({
    meta: [
      { title: "Matches — footArena" },
      {
        name: "description",
        content: "Keep track of your upcoming and recent football matches.",
      },
    ],
  }),
  component: MatchesScreen,
});

const fallbackMatches: Match[] = [
  {
    id: "powai-rangers",
    format: { code: "7v7" },
    venue: { name: "Turf 9, Powai" },
    scheduledAt: "2026-09-04T19:00:00+05:30",
    status: "open",
    costPerHead: 250,
    teams: [
      { side: "home", name: "Powai Rangers" },
      { side: "away", name: "Hiranandani FC" },
    ],
    playersJoined: 11,
    playersNeeded: 14,
  },
  {
    id: "marine-lines-xi",
    format: { code: "11v11" },
    venue: { name: "Cross Maidan" },
    scheduledAt: "2026-09-06T06:30:00+05:30",
    status: "open",
    costPerHead: null,
    teams: [
      { side: "home", name: "Marine Lines XI" },
      { side: "away", name: "Open side" },
    ],
    playersJoined: 17,
    playersNeeded: 22,
  },
];

function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>(fallbackMatches);

  useEffect(() => {
    const accessToken = localStorage.getItem("footArena.accessToken");
    if (!accessToken) return;

    listMatches(accessToken)
      .then((page) => {
        if (page.items.length) setMatches(page.items);
      })
      .catch(() => undefined);
  }, []);

  return (
    <AppShell className="pb-28">
      <header className="px-5 pt-12 pb-5">
        <p className="text-[10px] font-700 tracking-[0.15em] text-primary uppercase">
          Your football
        </p>
        <h1 className="mt-1 font-display text-3xl leading-none font-700 uppercase">Matches</h1>
      </header>

      <main className="space-y-5 px-5">
        <section className="panel rounded-3xl p-4">
          <div className="flex items-center gap-3">
            <div className="volt-fill flex size-11 shrink-0 items-center justify-center rounded-xl">
              <Trophy className="size-5" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-[10px] font-600 tracking-[0.14em] text-muted-foreground uppercase">
                Season record
              </p>
              <p className="mt-1 font-display text-2xl leading-none font-700">
                04 <span className="text-muted-foreground">played</span>
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[10px] font-600 tracking-[0.14em] text-muted-foreground uppercase">
                Skill rating
              </p>
              <p className="mt-1 font-display text-2xl leading-none font-700 text-primary">—</p>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <div className="flex items-end justify-between px-0.5">
            <div>
              <p className="text-[10px] font-600 tracking-[0.14em] text-muted-foreground uppercase">
                Ready when you are
              </p>
              <h2 className="font-display text-[21px] font-700 tracking-wide uppercase">
                Upcoming
              </h2>
            </div>
            <span className="text-[11px] font-600 text-primary">{matches.length} matches</span>
          </div>
          <div className="space-y-2">
            {matches.map((match) => (
              <MatchRow key={match.id} match={match} />
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-[21px] font-700 tracking-wide uppercase">
            Recent scorecards
          </h2>
          <article className="panel rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground">Powai Rangers</p>
                <p className="mt-1 text-[13px] font-700">vs Turf Titans</p>
              </div>
              <p className="tnum font-display text-3xl font-700">
                4 <span className="text-muted-foreground">–</span> 2
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] font-600 text-muted-foreground uppercase">
              <span>Last Sunday · 7v7</span>
              <span className="text-primary">MVP · scorecard ready</span>
            </div>
          </article>
        </section>
      </main>

      <BottomNav active="matches" />
    </AppShell>
  );
}

function MatchRow({ match }: { match: Match }) {
  const time = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(match.scheduledAt));

  return (
    <article className="panel rounded-2xl p-3.5">
      <div className="flex items-start gap-3">
        <div className="pitch-fill flex size-12 shrink-0 flex-col items-center justify-center rounded-xl">
          <span className="font-display text-sm leading-none font-700">{match.format.code}</span>
          <span className="mt-0.5 text-[9px] tracking-wide uppercase">open</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[13px] font-700">
            {match.teams.map((team) => team.name).join(" vs ")}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <CalendarDays className="size-3" strokeWidth={2.2} /> {time}
          </p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
            <MapPin className="size-3" strokeWidth={2.2} /> {match.venue.name}
          </p>
        </div>
        <span className="tnum shrink-0 text-[11px] font-700 text-primary">
          {match.costPerHead ? `₹${match.costPerHead}` : "Free"}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Users className="size-3.5 text-pitch" strokeWidth={2.2} />
        <span className="tnum text-[10px] text-muted-foreground">
          {match.playersJoined}/{match.playersNeeded} players in
        </span>
        <Link to="/player" className="panel-2 ml-auto flex items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] font-700 tracking-wide uppercase active:scale-95">
          View <ChevronRight className="size-3" strokeWidth={2.6} />
        </Link>
      </div>
    </article>
  );
}

function BottomNav({ active }: { active: "matches" }) {
  return (
    <nav className="panel fixed bottom-4 left-1/2 z-20 flex w-[calc(100%-2.5rem)] max-w-[390px] -translate-x-1/2 items-center justify-between rounded-2xl px-2 py-2">
      <Link to="/home" className="flex w-14 flex-col items-center gap-1 py-1 text-muted-foreground">
        <Home className="size-[18px]" strokeWidth={2.4} />
        <span className="text-[9px] font-600 tracking-wide uppercase">Home</span>
      </Link>
      <Link
        to="/discover"
        className="flex w-14 flex-col items-center gap-1 py-1 text-muted-foreground"
      >
        <Compass className="size-[18px]" strokeWidth={2.2} />
        <span className="text-[9px] font-600 tracking-wide uppercase">Discover</span>
      </Link>
      <Link
        to="/host"
        aria-label="Host a match"
        className="volt-fill flex size-11 items-center justify-center rounded-xl active:scale-95"
      >
        <Plus className="size-5" strokeWidth={2.8} />
      </Link>
      <span
        className={`flex w-14 flex-col items-center gap-1 py-1 ${active === "matches" ? "text-primary" : "text-muted-foreground"}`}
      >
        <ClipboardList className="size-[18px]" strokeWidth={2.2} />
        <span className="text-[9px] font-600 tracking-wide uppercase">Matches</span>
      </span>
      <Link
        to="/profile"
        className="flex w-14 flex-col items-center gap-1 py-1 text-muted-foreground"
      >
        <UserRound className="size-[18px]" strokeWidth={2.2} />
        <span className="text-[9px] font-600 tracking-wide uppercase">Profile</span>
      </Link>
    </nav>
  );
}
