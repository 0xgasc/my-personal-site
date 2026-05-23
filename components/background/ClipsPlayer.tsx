"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Clip } from "@/lib/clips/types";

interface Props {
  clips: Clip[];
  zIndex?: number;
  /** Notified whenever the active clip changes (so the dither layer can
   *  swap per-clip FX overrides). */
  onActiveClipChange?: (clip: Clip | null) => void;
}

function pickWeighted(clips: Clip[], excludeId?: string): Clip {
  const pool = clips.filter((c) => c.id !== excludeId);
  const list = pool.length ? pool : clips;
  const total = list.reduce((s, c) => s + Math.max(1, c.weight), 0);
  let r = Math.random() * total;
  for (const c of list) {
    r -= Math.max(1, c.weight);
    if (r <= 0) return c;
  }
  return list[list.length - 1];
}

function initialStartTime(clip: Clip, duration: number): number {
  if (!duration || duration < 5) return 0;
  const safeMax = Math.max(0, duration - 5);
  switch (clip.startMode) {
    case "fixed":
      return Math.min(safeMax, clip.startFixedSec ?? 0);
    case "window": {
      const min = Math.min(safeMax, Math.max(0, clip.startWindowMinSec ?? 0));
      const max = Math.min(safeMax, Math.max(min, clip.startWindowMaxSec ?? safeMax));
      return min + Math.random() * (max - min);
    }
    default:
      return Math.random() * safeMax;
  }
}

function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 768px)").matches;
}

function getCoverStyle(clip: Clip): React.CSSProperties {
  const mobile = isMobile();
  // Default cover: oversize to fit viewport at 16:9.
  const baseW = "max(100vw, 177.78vh)";
  const baseH = "max(56.25vw, 100vh)";

  if (!mobile) {
    return {
      width: baseW,
      height: baseH,
      objectFit: "cover",
    };
  }

  // Mobile-specific zoom strategy
  if (clip.mobileZoom === "contain") {
    return {
      width: "100vw",
      height: "100vh",
      objectFit: "contain",
    };
  }
  if (clip.mobileZoom === "overscan") {
    // For vertical-oriented clips on mobile, oversize portrait-style
    if (clip.orientation === "portrait") {
      return {
        width: "max(120vw, 67.5vh)",
        height: "max(177.78vw, 120vh)",
        objectFit: "cover",
      };
    }
    return {
      width: "max(140vw, 248vh)",
      height: "max(78.75vw, 140vh)",
      objectFit: "cover",
    };
  }
  // cover (default)
  if (clip.orientation === "portrait") {
    return {
      width: "max(100vw, 56.25vh)",
      height: "max(177.78vw, 100vh)",
      objectFit: "cover",
    };
  }
  return {
    width: baseW,
    height: baseH,
    objectFit: "cover",
  };
}

export default function ClipsPlayer({ clips, zIndex = -2, onActiveClipChange }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [active, setActive] = useState<Clip | null>(() =>
    clips.length ? pickWeighted(clips) : null
  );

  // Notify parent of active-clip changes for per-clip FX.
  useEffect(() => {
    onActiveClipChange?.(active);
  }, [active, onActiveClipChange]);

  // Schedule the next jump/swap.
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const v = videoRef.current;
    if (!v) return;

    function scheduleNext() {
      if (cancelled || !active) return;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const minS = active.segmentMinSec;
      const maxS = Math.max(minS + 1, active.segmentMaxSec);
      const ms = (minS + Math.random() * (maxS - minS)) * 1000;
      timeoutRef.current = setTimeout(nextJump, ms);
    }

    function nextJump() {
      if (cancelled) return;
      // With multiple clips, roughly 50% chance to rotate to another.
      if (clips.length > 1 && Math.random() < 0.5) {
        setActive(pickWeighted(clips, active!.id));
      } else if (v && v.duration > 8) {
        const newStart = initialStartTime(active!, v.duration);
        v.currentTime = newStart;
        v.play().catch(() => {});
        scheduleNext();
      } else {
        scheduleNext();
      }
    }

    function onLoadedMeta() {
      if (!v) return;
      v.currentTime = initialStartTime(active!, v.duration);
      v.play().catch(() => {});
      scheduleNext();
    }
    function onEnded() {
      nextJump();
    }

    v.addEventListener("loadedmetadata", onLoadedMeta);
    v.addEventListener("ended", onEnded);

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      v.removeEventListener("loadedmetadata", onLoadedMeta);
      v.removeEventListener("ended", onEnded);
    };
  }, [active, clips]);

  // Resolve URL — proxy remote URLs through /api/video to stay same-origin.
  const src = useMemo(() => {
    if (!active?.videoUrl) return "";
    const raw = active.videoUrl;
    if (raw.startsWith("/")) return raw;
    try {
      const u = new URL(raw, window.location.origin);
      if (u.origin === window.location.origin) return raw;
      return `/api/video?url=${encodeURIComponent(raw)}`;
    } catch {
      return raw;
    }
  }, [active?.videoUrl]);

  if (!active || !src) return null;
  const style = getCoverStyle(active);

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
        key={src}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          ...style,
        }}
      />
    </div>
  );
}
