"use client";

import { NEXT_CLIP_EVENT } from "./ClipFxPlayer";

/**
 * Small "easter" button bottom-left of the page. Fires the global
 * NEXT_CLIP_EVENT — ClipFxPlayer listens and triggers an immediate
 * jump to a new random clip / random start.
 *
 * Intentionally subtle (low-opacity sparkle) so it doesn't compete
 * with the content; reveals fully on hover.
 */
export default function NextClipButton() {
  return (
    <button
      onClick={() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent(NEXT_CLIP_EVENT));
        }
      }}
      aria-label="skip to next clip"
      title="skip to next clip"
      style={{
        position: "fixed",
        left: 14,
        bottom: 14,
        zIndex: 60,
        width: 36,
        height: 36,
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.18)",
        background: "rgba(0,0,0,0.35)",
        color: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        cursor: "pointer",
        fontSize: 13,
        lineHeight: 1,
        padding: 0,
        opacity: 0.55,
        transition: "opacity 200ms ease, transform 200ms ease, color 200ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.color = "rgba(255,255,255,0.95)";
        e.currentTarget.style.transform = "scale(1.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "0.55";
        e.currentTarget.style.color = "rgba(255,255,255,0.55)";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      ✦
    </button>
  );
}
