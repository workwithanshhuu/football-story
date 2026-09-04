import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, KeyRound, Mail } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { loginWithEmail, registerWithEmail } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — footArena" },
      {
        name: "description",
        content:
          "Play. Get scored. Get known. Sign in to footArena and start building your football story, one match at a time.",
      },
      { property: "og:title", content: "Sign in — footArena" },
      {
        property: "og:description",
        content: "Play. Get scored. Get known, your football story, one match at a time.",
      },
    ],
  }),
  component: LoginScreen,
});

function LoginScreen() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const tokens = isRegistering
        ? await registerWithEmail(email, password)
        : await loginWithEmail(email, password);
      localStorage.setItem("footArena.accessToken", tokens.accessToken);
      localStorage.setItem("footArena.refreshToken", tokens.refreshToken);
      window.location.href = "/home";
    } catch {
      setError("We could not sign you in. Check your details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell className="justify-between px-5 pt-14 pb-8">
      {/* brand */}
      <header className="flex flex-col gap-7">
        <div className="flex items-center gap-2.5">
          <span className="volt-fill flex size-9 items-center justify-center rounded-xl font-display text-lg font-800 leading-none">
            FA
          </span>
          <span className="font-display text-xl font-700 tracking-wide uppercase">
            foot<span className="text-primary">Arena</span>
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-[42px] leading-[0.95] font-700 uppercase">
            Your football
            <br />
            <span className="text-primary">story.</span>
          </h1>
          <p className="max-w-[19rem] text-sm leading-relaxed text-muted-foreground">
            Play, get scored, and keep every match in one place.
          </p>
        </div>
      </header>

      {/* auth panel */}
      <section className="panel mt-8 rounded-3xl p-5">
        <form className="space-y-3" onSubmit={handleSubmit}>
          <Field label="Email">
            <Mail className="size-4 shrink-0 text-muted-foreground" strokeWidth={2.2} />
            <input
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="you@club.com"
              className="w-full bg-transparent text-sm font-500 outline-none placeholder:text-muted-foreground/70"
            />
          </Field>
          <Field label="Password">
            <KeyRound className="size-4 shrink-0 text-muted-foreground" strokeWidth={2.2} />
            <input
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="8+ characters"
              className="w-full bg-transparent text-sm font-500 outline-none placeholder:text-muted-foreground/70"
            />
          </Field>
          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="volt-fill flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-700 tracking-wide uppercase transition-transform active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? "Connecting..." : isRegistering ? "Create account" : "Log in"}
            <ArrowRight className="size-4" strokeWidth={2.6} />
          </button>
        </form>

        <button
          type="button"
          onClick={() => setIsRegistering((value) => !value)}
          className="mt-4 w-full text-center text-[11px] font-600 text-primary"
        >
          {isRegistering
            ? "Already have an account? Log in"
            : "New here? Create your player profile"}
        </button>
      </section>

      <footer className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground/80">
        One account for your player, referee, and host roles.
      </footer>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="panel-2 block rounded-2xl px-4 py-2.5">
      <span className="text-[10px] font-600 tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </span>
      <div className="mt-1 flex items-center gap-2.5">{children}</div>
    </label>
  );
}
