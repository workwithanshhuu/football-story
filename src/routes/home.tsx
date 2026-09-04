import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Clock3,
  Compass,
  Home,
  MapPin,
  Plus,
  Search,
  Share2,
  UserRound,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { getCurrentUser, listMatches, type Match, type User } from "@/lib/api";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — footArena" },
      {
        name: "description",
        content:
          "Your next match, matches near you, live logging and your latest scorecard — the footArena home screen for every player.",
      },
      { property: "og:title", content: "Home — footArena" },
      {
        property: "og:description",
        content: "Your next match, matches near you and your latest scorecard, all in one place.",
      },
    ],
  }),
  component: HomeScreen,
});

const nearby = [
  {
    title: "Turf 9 · Sunday Sweat",
    format: "7v7",
    time: "Sun · 7:00 AM",
    venue: "Powai Turf Arena",
    km: "2.4 km",
    joined: 11,
    needed: 14,
    price: "₹250",
  },
  {
    title: "Midweek Fives",
    format: "5v5",
    time: "Wed · 9:30 PM",
    venue: "Andheri Sports Club",
    km: "5.1 km",
    joined: 8,
    needed: 10,
    price: "₹180",
  },
  {
    title: "Marine Lines XI",
    format: "11v11",
    time: "Sat · 6:30 AM",
    venue: "Cross Maidan",
    km: "8.7 km",
    joined: 17,
    needed: 22,
    price: "Free",
  },
];

function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const accessToken = localStorage.getItem("footArena.accessToken");
    if (!accessToken) return;

    Promise.all([getCurrentUser(accessToken), listMatches(accessToken)])
      .then(([currentUser, matchPage]) => {
        setUser(currentUser);
        setMatches(matchPage.items);
      })
      .catch(() => undefined);
  }, []);

  const displayName = user?.displayName ?? "Your profile";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const matchCards = matches.length
    ? matches.map((match) => ({
        title: match.teams.map((team) => team.name).join(" vs "),
        format: match.format.code,
        time: new Intl.DateTimeFormat("en-IN", {
          weekday: "short",
          hour: "numeric",
          minute: "2-digit",
        }).format(new Date(match.scheduledAt)),
        venue: match.venue.name,
        km: "",
        joined: match.playersJoined,
        needed: match.playersNeeded,
        price: match.costPerHead ? `₹${match.costPerHead}` : "Free",
      }))
    : nearby;

  return (
    <AppShell className="pb-28">
      {/* header */}
      <header className="flex items-center justify-between px-5 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <span className="pitch-fill flex size-11 items-center justify-center rounded-2xl border border-border font-display text-base font-700">
            {initials || "FA"}
          </span>
          <div className="leading-tight">
            <p className="backdrop-text text-[15px] font-700">{displayName}</p>
            <p className="backdrop-text flex items-center gap-1 text-[11px] opacity-85">
              <MapPin className="size-3" strokeWidth={2.4} />
              {user?.city
                ? `${user.city}${user.area ? ` · ${user.area}` : ""}`
                : "Set your location"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IconButton label="Search">
            <Search className="size-[18px]" strokeWidth={2.2} />
          </IconButton>
          <IconButton label="Notifications" dot>
            <Bell className="size-[18px]" strokeWidth={2.2} />
          </IconButton>
        </div>
      </header>

      <main className="space-y-4 px-5">
        {/* next match */}
        <section className="panel relative overflow-hidden rounded-3xl">
          <div className="relative bg-surface/80 p-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-700 tracking-[0.12em] text-primary uppercase">
                <Clock3 className="size-3" strokeWidth={2.6} />
                Next match · in 6h
              </span>
              <span className="panel-2 rounded-full px-2.5 py-1 text-[10px] font-700 tracking-wide uppercase">
                7v7
              </span>
            </div>

            <h2 className="mt-3 font-display text-2xl leading-none font-700 uppercase">
              Powai Rangers <span className="text-muted-foreground">vs</span> Hiranandani FC
            </h2>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3.5" strokeWidth={2.2} />
                Today · 7:00 PM
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" strokeWidth={2.2} />
                Turf 9, Powai
              </span>
            </p>

            <div className="mt-3 flex items-center gap-2">
              <Link
                to="/referee"
                className="volt-fill flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-[12px] font-700 tracking-wide uppercase active:scale-[0.98]"
              >
                <ClipboardList className="size-4" strokeWidth={2.4} />
                Open logger
              </Link>
              <button className="panel-2 flex size-10 items-center justify-center rounded-xl text-foreground active:scale-95">
                <Share2 className="size-4" strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </section>

        {/* nearby matches */}
        <section className="space-y-2">
          <SectionHead title="Matches near you" action="See all" />
          <div className="space-y-2">
            {matchCards.map((m) => (
              <article
                key={m.title}
                className="panel flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-surface-2"
              >
                <div className="pitch-fill flex size-12 shrink-0 flex-col items-center justify-center rounded-xl border border-border">
                  <span className="font-display text-sm leading-none font-700">{m.format}</span>
                  <span className="mt-0.5 text-[9px] tracking-wide uppercase opacity-80">
                    {m.km}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-700">{m.title}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {m.time} · {m.venue}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1 w-20 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(m.joined / m.needed) * 100}%` }}
                      />
                    </div>
                    <span className="tnum text-[10px] font-600 text-muted-foreground">
                      {m.joined}/{m.needed} in
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="tnum text-[11px] font-700 text-primary">{m.price}</span>
                  <button className="panel-2 flex items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] font-700 tracking-wide uppercase active:scale-95">
                    Join
                    <ChevronRight className="size-3" strokeWidth={2.6} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* tab bar */}
      <nav className="panel fixed bottom-4 left-1/2 z-20 flex w-[calc(100%-2.5rem)] max-w-[390px] -translate-x-1/2 items-center justify-between rounded-2xl px-2 py-2">
        <Tab icon={<Home className="size-[18px]" strokeWidth={2.4} />} label="Home" active />
        <Link to="/discover" className="contents">
          <Tab icon={<Compass className="size-[18px]" strokeWidth={2.2} />} label="Discover" />
        </Link>
        <Link
          to="/host"
          aria-label="Host a match"
          className="volt-fill flex size-11 items-center justify-center rounded-xl active:scale-95"
        >
          <Plus className="size-5" strokeWidth={2.8} />
        </Link>
        <Link to="/matches" className="contents">
          <Tab icon={<ClipboardList className="size-[18px]" strokeWidth={2.2} />} label="Matches" />
        </Link>
        <Link to="/profile" className="contents">
          <Tab icon={<UserRound className="size-[18px]" strokeWidth={2.2} />} label="Profile" />
        </Link>
      </nav>
    </AppShell>
  );
}

function IconButton({
  children,
  label,
  dot,
}: {
  children: React.ReactNode;
  label: string;
  dot?: boolean;
}) {
  return (
    <button
      aria-label={label}
      className="panel-2 relative flex size-10 items-center justify-center rounded-xl active:scale-95"
    >
      {children}
      {dot && (
        <span className="absolute top-2 right-2 size-1.5 rounded-full bg-primary ring-2 ring-background" />
      )}
    </button>
  );
}

function SectionHead({ title, action }: { title: string; action: string }) {
  return (
    <div className="flex items-baseline justify-between px-0.5">
      <h3 className="backdrop-text font-display text-[17px] font-700 tracking-wide uppercase">
        {title}
      </h3>
      <button className="text-[11px] font-600 text-primary">{action}</button>
    </div>
  );
}

function Tab({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button
      className={`flex w-14 flex-col items-center gap-1 py-1 ${
        active ? "text-primary" : "text-muted-foreground"
      }`}
    >
      {icon}
      <span className="text-[9px] font-600 tracking-wide uppercase">{label}</span>
    </button>
  );
}
