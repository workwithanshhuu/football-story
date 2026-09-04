import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Clock3,
  Compass,
  Flame,
  Goal,
  Handshake,
  Home,
  MapPin,
  Plus,
  Search,
  Share2,
  ShieldCheck,
  Target,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import pitchTop from "@/assets/pitch-top.jpg";

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
        content:
          "Your next match, matches near you and your latest scorecard, all in one place.",
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
  return (
    <AppShell className="pb-28">
      {/* header */}
      <header className="flex items-center justify-between px-5 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <span className="pitch-fill flex size-11 items-center justify-center rounded-2xl border border-border font-display text-base font-700">
            AG
          </span>
          <div className="leading-tight">
            <p className="text-[15px] font-700">Anshu Gupta</p>
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="size-3" strokeWidth={2.4} />
              Mumbai · Powai
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
        {/* rating strip */}
        <section className="panel flex items-stretch gap-3 rounded-2xl p-3">
          <div className="flex flex-col justify-center pr-3">
            <p className="text-[10px] font-600 tracking-[0.14em] text-muted-foreground uppercase">
              Rating
            </p>
            <p className="tnum font-display text-3xl leading-none font-700 text-primary">7.8</p>
          </div>
          <div className="w-px bg-border" />
          <div className="grid flex-1 grid-cols-3 gap-1">
            <Stat icon={<Goal className="size-3.5" strokeWidth={2.4} />} value="12" label="Goals" />
            <Stat
              icon={<Handshake className="size-3.5" strokeWidth={2.4} />}
              value="09"
              label="Assists"
            />
            <Stat
              icon={<Trophy className="size-3.5" strokeWidth={2.4} />}
              value="04"
              label="MVP"
            />
          </div>
        </section>

        {/* next match */}
        <section className="panel relative overflow-hidden rounded-3xl">
          <img
            src={pitchTop}
            alt=""
            aria-hidden
            loading="lazy"
            width={1024}
            height={1024}
            className="absolute inset-0 size-full object-cover opacity-25"
          />
          <div aria-hidden className="veil absolute inset-0" />
          <div className="relative p-4">
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
              <button className="volt-fill flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-[12px] font-700 tracking-wide uppercase active:scale-[0.98]">
                <ClipboardList className="size-4" strokeWidth={2.4} />
                Open logger
              </button>
              <button className="panel-2 flex size-10 items-center justify-center rounded-xl text-foreground active:scale-95">
                <Share2 className="size-4" strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </section>

        {/* quick actions */}
        <section className="grid grid-cols-4 gap-2">
          <Action icon={<Plus className="size-[18px]" strokeWidth={2.4} />} label="Host" primary />
          <Action icon={<Compass className="size-[18px]" strokeWidth={2.2} />} label="Find" />
          <Action icon={<Users className="size-[18px]" strokeWidth={2.2} />} label="Squad" />
          <Action icon={<Target className="size-[18px]" strokeWidth={2.2} />} label="Stats" />
        </section>

        {/* nearby matches */}
        <section className="space-y-2">
          <SectionHead title="Matches near you" action="See all" />
          <div className="space-y-2">
            {nearby.map((m) => (
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

        {/* last scorecard */}
        <section className="space-y-2">
          <SectionHead title="Your last scorecard" action="Share" />
          <article className="panel rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-[11px] font-600 text-muted-foreground">Powai Rangers</p>
              </div>
              <p className="tnum font-display text-3xl leading-none font-700">
                4 <span className="text-muted-foreground">–</span> 2
              </p>
              <div className="text-center">
                <p className="text-[11px] font-600 text-muted-foreground">Turf Titans</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Chip icon={<Trophy className="size-3" strokeWidth={2.6} />} tone="volt">
                MVP
              </Chip>
              <Chip icon={<Goal className="size-3" strokeWidth={2.6} />}>2 goals</Chip>
              <Chip icon={<Handshake className="size-3" strokeWidth={2.6} />}>1 assist</Chip>
              <Chip icon={<ShieldCheck className="size-3" strokeWidth={2.6} />} tone="pitch">
                Referee verified
              </Chip>
            </div>
          </article>
        </section>

        {/* form */}
        <section className="panel flex items-center justify-between rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2">
            <Flame className="size-4 text-primary" strokeWidth={2.4} />
            <span className="text-[12px] font-600">Last 5 matches</span>
          </div>
          <div className="flex gap-1.5">
            {["W", "W", "D", "L", "W"].map((r, i) => (
              <span
                key={i}
                className={`flex size-6 items-center justify-center rounded-md text-[10px] font-700 ${
                  r === "W"
                    ? "volt-fill"
                    : r === "D"
                      ? "panel-2 text-foreground"
                      : "bg-destructive/85 text-destructive-foreground"
                }`}
              >
                {r}
              </span>
            ))}
          </div>
        </section>
      </main>

      {/* tab bar */}
      <nav className="panel fixed bottom-4 left-1/2 z-20 flex w-[calc(100%-2.5rem)] max-w-[390px] -translate-x-1/2 items-center justify-between rounded-2xl px-2 py-2">
        <Tab icon={<Home className="size-[18px]" strokeWidth={2.4} />} label="Home" active />
        <Tab icon={<Compass className="size-[18px]" strokeWidth={2.2} />} label="Discover" />
        <button className="volt-fill flex size-11 items-center justify-center rounded-xl active:scale-95">
          <Plus className="size-5" strokeWidth={2.8} />
        </button>
        <Tab icon={<ClipboardList className="size-[18px]" strokeWidth={2.2} />} label="Matches" />
        <Link to="/" className="contents">
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

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5">
      <span className="text-pitch">{icon}</span>
      <span className="tnum text-[15px] leading-none font-700">{value}</span>
      <span className="text-[9px] tracking-[0.1em] text-muted-foreground uppercase">{label}</span>
    </div>
  );
}

function Action({
  icon,
  label,
  primary,
}: {
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
}) {
  return (
    <button
      className={`flex flex-col items-center gap-1.5 rounded-2xl py-3 active:scale-95 ${
        primary ? "volt-fill" : "panel"
      }`}
    >
      {icon}
      <span className="text-[10px] font-700 tracking-[0.1em] uppercase">{label}</span>
    </button>
  );
}

function SectionHead({ title, action }: { title: string; action: string }) {
  return (
    <div className="flex items-baseline justify-between px-0.5">
      <h3 className="font-display text-[17px] font-700 tracking-wide uppercase">{title}</h3>
      <button className="text-[11px] font-600 text-primary">{action}</button>
    </div>
  );
}

function Chip({
  children,
  icon,
  tone = "muted",
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  tone?: "muted" | "volt" | "pitch";
}) {
  const tones = {
    muted: "panel-2 text-foreground",
    volt: "bg-primary/15 text-primary border border-primary/25",
    pitch: "bg-pitch/20 text-pitch border border-pitch/30",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-700 tracking-wide uppercase ${tones[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}

function Tab({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
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
