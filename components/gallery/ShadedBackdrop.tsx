import type { CSSProperties } from "react";

/** Dark vignette + blur behind modals, so the page recedes like a lit stage. */
export const shadedBackdropStyle: CSSProperties = {
  background:
    "radial-gradient(120% 90% at 50% 42%, rgba(22,22,26,0.62) 0%, rgba(6,6,8,0.88) 58%, rgba(0,0,0,0.97) 100%)",
  backdropFilter: "blur(18px) saturate(115%)",
  WebkitBackdropFilter: "blur(18px) saturate(115%)",
};

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='3 0 0 0 -1 3 0 0 0 -1 3 0 0 0 -1 0 0 0 0 1'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** Fine film grain over the backdrop. Place as the first child. */
export function BackdropGrain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ backgroundImage: NOISE, opacity: 0.06 }}
    />
  );
}
