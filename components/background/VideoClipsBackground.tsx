"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  /** Array of remote video URLs (Irys/Arweave/anywhere CORS-OK). */
  clips: string[];
  /** Min seconds before jumping to a new random spot. */
  minSegmentSec?: number;
  /** Max seconds before jumping. */
  maxSegmentSec?: number;
  /** Probability per jump to switch to a different clip instead of seeking. */
  switchClipProbability?: number;
  zIndex?: number;
}

/**
 * Self-hosted video backdrop with collage behavior.
 *   - Picks a random clip from the list
 *   - Starts at a random offset
 *   - Every 6–22 s (random), either seeks to a new random spot within the
 *     same clip or rotates to a different clip
 *   - Native <video autoplay muted loop playsinline> — works on Safari
 *     and Chrome without third-party APIs
 *
 * Cross-origin clips are routed through /api/video so WebGL FX layers
 * could sample them (and to keep the request same-origin).
 */
export default function VideoClipsBackground({
  clips,
  minSegmentSec = 6,
  maxSegmentSec = 22,
  switchClipProbability = 0.4,
  zIndex = -2,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [clipIndex, setClipIndex] = useState(() => Math.floor(Math.random() * clips.length));

  // Resolve clip URL — proxy remote URLs through /api/video so we stay
  // same-origin (better caching, no CORS hiccups, no taint).
  function resolveUrl(raw: string): string {
    if (!raw) return "";
    if (raw.startsWith("/")) return raw; // already same-origin
    try {
      const u = new URL(raw, window.location.origin);
      if (u.origin === window.location.origin) return raw;
      return `/api/video?url=${encodeURIComponent(raw)}`;
    } catch {
      return raw;
    }
  }

  useEffect(() => {
    let cancelled = false;
    const v = videoRef.current;
    if (!v || clips.length === 0) return;

    function scheduleJump() {
      if (cancelled) return;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const ms =
        (minSegmentSec + Math.random() * Math.max(0, maxSegmentSec - minSegmentSec)) *
        1000;
      timeoutRef.current = setTimeout(jump, ms);
    }

    function jump() {
      if (cancelled) return;
      const switchClip =
        clips.length > 1 && Math.random() < switchClipProbability;
      if (switchClip) {
        setClipIndex((i) => {
          let next = i;
          while (next === i) next = Math.floor(Math.random() * clips.length);
          return next;
        });
        // currentTime randomization for the new clip happens in onLoadedMetadata.
      } else if (v && v.duration && v.duration > 8) {
        v.currentTime = Math.random() * (v.duration - 5);
        v.play().catch(() => {});
        scheduleJump();
      } else {
        scheduleJump();
      }
    }

    function onLoadedMeta() {
      if (cancelled || !v) return;
      if (v.duration && v.duration > 8) {
        v.currentTime = Math.random() * (v.duration - 5);
      }
      v.play().catch(() => {});
      scheduleJump();
    }
    function onEnded() {
      // shouldn't fire because of loop, but if it does, rotate.
      jump();
    }
    function onCanPlay() {
      v?.play().catch(() => {});
    }

    v.addEventListener("loadedmetadata", onLoadedMeta);
    v.addEventListener("ended", onEnded);
    v.addEventListener("canplay", onCanPlay);

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      v.removeEventListener("loadedmetadata", onLoadedMeta);
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("canplay", onCanPlay);
    };
  }, [clipIndex, clips, minSegmentSec, maxSegmentSec, switchClipProbability]);

  if (clips.length === 0) return null;
  const currentSrc = resolveUrl(clips[clipIndex] ?? clips[0]);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex,
        overflow: "hidden",
        pointerEvents: "none",
        background: "#000",
      }}
    >
      <video
        ref={videoRef}
        key={currentSrc}
        src={currentSrc}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "max(100vw, 177.78vh)",
          height: "max(56.25vw, 100vh)",
          transform: "translate(-50%, -50%)",
          objectFit: "cover",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
