import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Award,
  ChevronRight,
  ClipboardList,
  Compass,
  Edit3,
  Goal,
  Handshake,
  Home,
  MapPin,
  Plus,
  Radio,
  ShieldCheck,
  Trophy,
  UserRound,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { getCurrentUser, type User } from "@/lib/api";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — footArena" },
      {
        name: "description",
        content: "Your player profile, football roles, and career highlights.",
      },
    ],
  }),
  component: ProfileScreen,
});

function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("footArena.accessToken");
    if (!accessToken) return;
    getCurrentUser(accessToken)
      .then(setUser)
      .catch(() => undefined);
  }, []);

  const displayName = user?.displayName || "Your player profile";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const location = user?.city
    ? `${user.city}${user.area ? ` · ${user.area}` : ""}`
    : "Add your location";

  return (
    <AppShell className="pb-28">
      <header className="flex items-center justify-between px-5 pt-12 pb-5">
        <div>
          <p className="text-[10px] font-700 tracking-[0.15em] text-primary uppercase">
            Player profile
          </p>
          <h1 className="mt-1 font-display text-3xl leading-none font-700 uppercase">
            Your story.
          </h1>
        </div>
        <button
          aria-label="Edit profile"
          className="panel-2 flex size-10 items-center justify-center rounded-xl"
        >
          <Edit3 className="size-4" strokeWidth={2.2} />
        </button>
      </header>

      <main className="space-y-4 px-5">
        <section className="panel relative overflow-hidden rounded-3xl p-5">
          <div
            aria-hidden
            className="absolute -top-16 -right-12 size-40 rounded-full border border-primary/15 bg-primary/5"
          />
          <div className="relative flex items-center gap-3">
            <div className="volt-fill flex size-16 shrink-0 items-center justify-center rounded-2xl font-display text-2xl font-700">
              {initials || "FA"}
            </div>
            <div className="min-w-0">
              <h2 className="truncate font-display text-2xl leading-none font-700 uppercase">
                {displayName}
              </h2>
              <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="size-3" strokeWidth={2.2} /> {location}
              </p>
              <p className="mt-1 text-[10px] font-600 tracking-wide text-primary uppercase">
                Player · Referee
              </p>
            </div>
          </div>
          <div className="relative mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4">
            <ProfileStat value={user?.skillSelfRating ? String(user.skillSelfRating) : "—"} label="Skill" />
            <ProfileStat value="12" label="Goals" />
            <ProfileStat value="04" label="MVPs" />
          </div>
        </section>

        <section className="panel rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[19px] font-700 tracking-wide uppercase">
              On the pitch
            </h2>
            <Award className="size-5 text-primary" strokeWidth={2.1} />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(user?.positions.length ? user.positions : ["Midfielder", "Playmaker"]).map(
              (position) => (
                <span
                  key={position}
                  className="panel-2 rounded-full px-3 py-1.5 text-[10px] font-700 tracking-wide uppercase"
                >
                  {position}
                </span>
              ),
            )}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Highlight icon={<Goal className="size-4" />} value="12" label="Goals" />
            <Highlight icon={<Handshake className="size-4" />} value="09" label="Assists" />
            <Highlight icon={<ShieldCheck className="size-4" />} value="18" label="Matches" />
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-[19px] font-700 tracking-wide uppercase">
            Your footArena
          </h2>
          <ProfileAction
            icon={<Trophy className="size-4" />}
            title="Scorecards"
            detail="Your match history and ratings"
          />
          <ProfileAction
            href="/referee"
            icon={<ShieldCheck className="size-4" />}
            title="Referee console"
            detail="Log the live match and manage events"
          />
          <ProfileAction
            href="/player"
            icon={<Radio className="size-4" />}
            title="Player live view"
            detail="Follow the score without editing the log"
          />
          <ProfileAction
            icon={<ShieldCheck className="size-4" />}
            title="Verification"
            detail="Build trust with every game"
          />
          <ProfileAction
            icon={<UserRound className="size-4" />}
            title="Account settings"
            detail="Login, privacy, and preferences"
          />
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
        <Link
          to="/matches"
          className="flex w-14 flex-col items-center gap-1 py-1 text-muted-foreground"
        >
          <ClipboardList className="size-[18px]" strokeWidth={2.2} />
          <span className="text-[9px] font-600 tracking-wide uppercase">Matches</span>
        </Link>
        <span className="flex w-14 flex-col items-center gap-1 py-1 text-primary">
          <UserRound className="size-[18px]" strokeWidth={2.2} />
          <span className="text-[9px] font-600 tracking-wide uppercase">Profile</span>
        </span>
      </nav>
    </AppShell>
  );
}

function ProfileStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="tnum font-display text-xl leading-none font-700 text-primary">{value}</p>
      <p className="mt-1 text-[9px] font-600 tracking-[0.1em] text-muted-foreground uppercase">
        {label}
      </p>
    </div>
  );
}

function Highlight({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="panel-2 rounded-xl p-2.5 text-center">
      <span className="flex justify-center text-pitch">{icon}</span>
      <p className="tnum mt-1 font-display text-lg leading-none font-700">{value}</p>
      <p className="mt-1 text-[9px] tracking-wide text-muted-foreground uppercase">{label}</p>
    </div>
  );
}

function ProfileAction({
  icon,
  title,
  detail,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  href?: "/referee" | "/player";
}) {
  const content = (
    <>
      <span className="panel-2 flex size-9 shrink-0 items-center justify-center rounded-xl text-primary">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-700">{title}</span>
        <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{detail}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" strokeWidth={2.4} />
    </>
  );
  return href ? (
    <Link to={href} className="panel flex w-full items-center gap-3 rounded-2xl p-3.5 text-left">
      {content}
    </Link>
  ) : (
    <button className="panel flex w-full items-center gap-3 rounded-2xl p-3.5 text-left">
      {content}
    </button>
  );
}
