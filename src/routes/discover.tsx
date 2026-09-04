import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  Compass,
  Home,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  UserRound,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { listMatches, type Match } from "@/lib/api";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover — footArena" },
      {
        name: "description",
        content: "Find your next football match and join players near you.",
      },
    ],
  }),
  component: DiscoverScreen,
});

const fallbackMatches = [
  {
    id: "turf-9",
    title: "Turf 9 · Sunday Sweat",
    format: "7v7",
    time: "Sun · 7:00 AM",
    venue: "Powai Turf Arena",
    distance: "2.4 km",
    joined: 11,
    needed: 14,
    price: "₹250",
    tone: "pitch",
  },
  {
    id: "midweek-fives",
    title: "Midweek Fives",
    format: "5v5",
    time: "Wed · 9:30 PM",
    venue: "Andheri Sports Club",
    distance: "5.1 km",
    joined: 8,
    needed: 10,
    price: "₹180",
    tone: "volt",
  },
  {
    id: "marine-lines",
    title: "Marine Lines XI",
    format: "11v11",
    time: "Sat · 6:30 AM",
    venue: "Cross Maidan",
    distance: "8.7 km",
    joined: 17,
    needed: 22,
    price: "Free",
    tone: "pitch",
  },
];

type DiscoverMatch = (typeof fallbackMatches)[number];

function DiscoverScreen() {
  const [matches, setMatches] = useState<DiscoverMatch[]>(fallbackMatches);
  const [selectedFormat, setSelectedFormat] = useState("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const accessToken = localStorage.getItem("footArena.accessToken");
    if (!accessToken) return;

    listMatches(accessToken)
      .then((page) => {
        if (!page.items.length) return;
        setMatches(page.items.map(toDiscoverMatch));
      })
      .catch(() => undefined);
  }, []);

  const visibleMatches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return matches.filter((match) => {
      const matchesFormat = selectedFormat === "All" || match.format === selectedFormat;
      const matchesQuery =
        !normalizedQuery || `${match.title} ${match.venue}`.toLowerCase().includes(normalizedQuery);
      return matchesFormat && matchesQuery;
    });
  }, [matches, query, selectedFormat]);

  return (
    <AppShell className="pb-28">
      <header className="flex items-center justify-between px-5 pt-12 pb-5">
        <div>
          <p className="text-[10px] font-700 tracking-[0.15em] text-primary uppercase">Discover</p>
          <h1 className="mt-1 font-display text-3xl leading-none font-700 uppercase">
            Find your game.
          </h1>
        </div>
        <button
          aria-label="Notifications"
          className="panel-2 relative flex size-10 items-center justify-center rounded-xl"
        >
          <Bell className="size-[18px]" strokeWidth={2.2} />
          <span className="absolute top-2 right-2 size-1.5 rounded-full bg-primary ring-2 ring-background" />
        </button>
      </header>

      <main className="space-y-5 px-5">
        <section className="panel rounded-3xl p-4">
          <div className="flex items-center gap-2.5">
            <Search className="size-4 shrink-0 text-muted-foreground" strokeWidth={2.3} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search venues or matches"
              className="min-w-0 flex-1 bg-transparent text-sm font-500 outline-none placeholder:text-muted-foreground/70"
              aria-label="Search venues or matches"
            />
            <SlidersHorizontal className="size-4 shrink-0 text-primary" strokeWidth={2.2} />
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
            {["All", "5v5", "7v7", "11v11"].map((format) => {
              const active = selectedFormat === format;
              return (
                <button
                  type="button"
                  key={format}
                  onClick={() => setSelectedFormat(format)}
                  className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-700 tracking-wide uppercase ${active ? "volt-fill" : "panel-2 text-muted-foreground"}`}
                >
                  {active && <Check className="size-3" strokeWidth={2.8} />}
                  {format === "All" ? "All formats" : format}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-2">
          <div className="flex items-end justify-between px-0.5">
            <div>
              <p className="text-[10px] font-600 tracking-[0.14em] text-muted-foreground uppercase">
                Around you
              </p>
              <h2 className="font-display text-[21px] font-700 tracking-wide uppercase">
                Open matches
              </h2>
            </div>
            <span className="text-[11px] font-600 text-primary">{visibleMatches.length} found</span>
          </div>

          {visibleMatches.length ? (
            <div className="space-y-2">
              {visibleMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <div className="panel rounded-2xl px-4 py-8 text-center">
              <p className="font-display text-xl font-700 uppercase">No matches found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try another format or search term.
              </p>
            </div>
          )}
        </section>

        <section className="panel rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="pitch-fill flex size-10 shrink-0 items-center justify-center rounded-xl">
              <Users className="size-5" strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-700">Bring your squad</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Host a match and fill every spot.
              </p>
            </div>
            <Link
              to="/host"
              aria-label="Host a match"
              className="panel-2 flex size-9 items-center justify-center rounded-xl"
            >
              <ChevronRight className="size-4" strokeWidth={2.5} />
            </Link>
          </div>
        </section>
      </main>

      <nav className="panel fixed bottom-4 left-1/2 z-20 flex w-[calc(100%-2.5rem)] max-w-[390px] -translate-x-1/2 items-center justify-between rounded-2xl px-2 py-2">
        <Link
          to="/home"
          className="flex w-14 flex-col items-center gap-1 py-1 text-muted-foreground"
        >
          <Home className="size-[18px]" strokeWidth={2.4} />
          <span className="text-[9px] font-600 tracking-wide uppercase">Home</span>
        </Link>
        <Tab icon={<Compass className="size-[18px]" strokeWidth={2.2} />} label="Discover" active />
        <Link
          to="/host"
          aria-label="Host a match"
          className="volt-fill flex size-11 items-center justify-center rounded-xl active:scale-95"
        >
          <Plus className="size-5" strokeWidth={2.8} />
        </Link>
        <Tab icon={<ClipboardList className="size-[18px]" strokeWidth={2.2} />} label="Matches" />
        <Link to="/" className="flex w-14 flex-col items-center gap-1 py-1 text-muted-foreground">
          <UserRound className="size-[18px]" strokeWidth={2.2} />
          <span className="text-[9px] font-600 tracking-wide uppercase">Profile</span>
        </Link>
      </nav>
    </AppShell>
  );
}

function MatchCard({ match }: { match: DiscoverMatch }) {
  return (
    <article className="panel rounded-2xl p-3.5">
      <div className="flex items-start gap-3">
        <div
          className={`${match.tone === "volt" ? "volt-fill" : "pitch-fill"} flex size-12 shrink-0 flex-col items-center justify-center rounded-xl`}
        >
          <span className="font-display text-sm leading-none font-700">{match.format}</span>
          <span className="mt-0.5 text-[9px] tracking-wide uppercase opacity-80">
            {match.distance}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-[13px] font-700">{match.title}</h3>
            <span className="tnum shrink-0 text-[11px] font-700 text-primary">{match.price}</span>
          </div>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <CalendarDays className="size-3" strokeWidth={2.2} /> {match.time}
          </p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
            <MapPin className="size-3" strokeWidth={2.2} /> {match.venue}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${(match.joined / match.needed) * 100}%` }}
          />
        </div>
        <span className="tnum text-[10px] font-600 text-muted-foreground">
          {match.joined}/{match.needed} players
        </span>
        <button className="panel-2 flex items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] font-700 tracking-wide uppercase active:scale-95">
          Join <ChevronRight className="size-3" strokeWidth={2.6} />
        </button>
      </div>
    </article>
  );
}

function toDiscoverMatch(match: Match): DiscoverMatch {
  return {
    id: match.id,
    title: match.teams.map((team) => team.name).join(" vs "),
    format: match.format.code,
    time: new Intl.DateTimeFormat("en-IN", {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(match.scheduledAt)),
    venue: match.venue.name,
    distance: "Nearby",
    joined: match.playersJoined,
    needed: match.playersNeeded,
    price: match.costPerHead ? `₹${match.costPerHead}` : "Free",
    tone: "pitch",
  };
}

function Tab({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button
      className={`flex w-14 flex-col items-center gap-1 py-1 ${active ? "text-primary" : "text-muted-foreground"}`}
    >
      {icon}
      <span className="text-[9px] font-600 tracking-wide uppercase">{label}</span>
    </button>
  );
}
