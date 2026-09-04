import type { ReactNode } from "react";

export function AppShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* layer 1 — tonal veil so content stays legible */}
      <div aria-hidden className="veil pointer-events-none fixed inset-0" />
      {/* layer 2 — pitch grid texture */}
      <div aria-hidden className="grid-lines pointer-events-none fixed inset-0 opacity-60" />

      {/* layer 3 — content */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[430px] flex-col">
        <div className={`screen-content flex flex-1 flex-col ${className}`}>{children}</div>
      </div>
    </div>
  );
}
