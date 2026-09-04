import type { ReactNode } from "react";
import stadium from "@/assets/stadium-night.jpg";

/**
 * Full-bleed stadium backdrop with a fixed veil + pitch grid.
 * Every screen's content renders in its own layer above the photo,
 * so cards, text and icons never blend into the image.
 */
export function AppShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* layer 0 — photograph */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${stadium})` }}
      />
      {/* layer 1 — darkening veil so content stays legible */}
      <div aria-hidden className="veil pointer-events-none fixed inset-0" />
      {/* layer 2 — pitch grid texture */}
      <div aria-hidden className="grid-lines pointer-events-none fixed inset-0 opacity-60" />

      {/* layer 3 — content */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[430px] flex-col">
        <div className={`flex flex-1 flex-col ${className}`}>{children}</div>
      </div>
    </div>
  );
}
