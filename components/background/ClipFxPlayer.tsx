"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import FxCanvas from "./FxCanvas";
import type { Clip } from "@/lib/clips/types";
import type { FxMode } from "@/lib/fx/effects";

function useIsIOS() {
  const [ios, setIos] = useState(false);
  useEffect(() => {
    setIos(/iP(hone|od|ad)/.test(navigator.userAgent));
  }, []);
  return ios;
}

interface Props {
  clips: Clip[];
  zIndex?: number;
  onActiveClipChange?: (clip: Clip | null) => void;
}

const HARD_MAX_SEGMENT_SEC = 30;
export const NEXT_CLIP_EVENT = "clip:next";

// ── Shuffle queue — full cycle before any clip repeats ───────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** CSS filter approximations for iOS (no WebGL). Not identical to the
 *  shader effects but much better than no treatment at all. */
function iosCssFilter(mode: FxMode): string {
  switch (mode) {
    case "crt":    return "contrast(1.2) brightness(0.82)";
    case "vhs":    return "saturate(0.65) hue-rotate(-8deg) contrast(1.15)";
    case "dream":  return "brightness(1.12) saturate(1.5)";
    case "ascii":  return "grayscale(1) contrast(2.5)";
    case "pixel":  return "contrast(1.3) saturate(0.7)";
    case "dither": return "grayscale(1) contrast(1.8)";
    default:       return "none";
  }
}

function computeStartSec(clip: Clip): number {
  switch (clip.startMode) {
    case "fixed":
      return Math.max(0, clip.startFixedSec ?? 0);
    case "window": {
      const lo = Math.max(0, clip.startWindowMinSec ?? 0);
      const hi = Math.max(lo, clip.startWindowMaxSec ?? lo + 30);
      return lo + Math.random() * (hi - lo);
    }
    default:
      return Math.random() * 600;
  }
}

function computeSegmentMs(clip: Clip): number {
  const minS = Math.max(3, Math.min(HARD_MAX_SEGMENT_SEC, clip.segmentMinSec));
  const maxS = Math.max(minS, Math.min(HARD_MAX_SEGMENT_SEC, clip.segmentMaxSec));
  return (minS + Math.random() * (maxS - minS)) * 1000;
}

export default function ClipFxPlayer({ clips, zIndex = 0, onActiveClipChange }: Props) {
  const isIOS = useIsIOS();

  // Shuffle queue: exhausts the full list before reshuffling.
  const queueRef = useRef<Clip[]>([]);

  function dequeue(lastId?: string): Clip {
    if (queueRef.current.length === 0) {
      queueRef.current = shuffle(clips);
      // Avoid immediate back-to-back repeat at queue boundary.
      if (lastId && queueRef.current[0]?.id === lastId && queueRef.current.length > 1) {
        queueRef.current.push(queueRef.current.shift()!);
      }
    }
    return queueRef.current.shift()!;
  }

  const [active, setActive] = useState<Clip | null>(() =>
    clips.length ? dequeue() : null
  );
  const [jumpKey, setJumpKey] = useState(0);
  const [seekTarget, setSeekTarget] = useState<number>(() =>
    active ? computeStartSec(active) : 0
  );
  const [queued, setQueued] = useState<Clip | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep active valid if the clips list changes.
  useEffect(() => {
    if (!active) {
      if (clips.length) {
        queueRef.current = [];
        const next = dequeue();
        setActive(next);
        setSeekTarget(computeStartSec(next));
        setJumpKey((k) => k + 1);
      }
      return;
    }
    if (!clips.find((c) => c.id === active.id)) {
      queueRef.current = [];
      const next = clips.length ? dequeue() : null;
      setActive(next);
      if (next) {
        setSeekTarget(computeStartSec(next));
        setJumpKey((k) => k + 1);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clips]);

  // Pre-pick next clip right when current one starts so it can buffer.
  useEffect(() => {
    if (clips.length > 0 && active) {
      // Peek without consuming — we'll consume in triggerJump.
      setQueued(queueRef.current[0] ?? null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpKey]);

  useEffect(() => {
    onActiveClipChange?.(active);
  }, [active, onActiveClipChange]);

  const triggerJump = useCallback(() => {
    if (!clips.length) return;
    const next = dequeue(active?.id);
    setActive(next);
    setSeekTarget(computeStartSec(next));
    setJumpKey((k) => k + 1);
    setQueued(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clips, active]);

  useEffect(() => {
    if (!active) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const ms = computeSegmentMs(active);
    timeoutRef.current = setTimeout(triggerJump, ms);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [active, jumpKey, triggerJump]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => triggerJump();
    window.addEventListener(NEXT_CLIP_EVENT, handler);
    return () => window.removeEventListener(NEXT_CLIP_EVENT, handler);
  }, [triggerJump]);

  if (!active) return null;

  if (isIOS) {
    return (
      <>
        <video
          key={`${active.id}:${jumpKey}`}
          src={active.videoUrl}
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          style={{
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex,
            pointerEvents: "none",
            filter: iosCssFilter(active.fxMode),
            transition: "filter 600ms ease",
          }}
        />
        {queued && queued.videoUrl !== active.videoUrl && (
          <video
            key={`q:${queued.id}`}
            src={queued.videoUrl}
            preload="auto"
            muted
            playsInline
            style={{ display: "none" }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <FxCanvas
        key={`${active.id}:${jumpKey}`}
        videoUrl={active.videoUrl}
        videoOpacity={1}
        videoBlur={0}
        mode={active.fxMode}
        params={active.fxParams}
        wet={active.fxWet}
        hover={active.hover}
        fixed
        zIndex={zIndex}
        initialSeekSec={seekTarget}
      />
      {queued && queued.videoUrl !== active.videoUrl && (
        <video
          key={`q:${queued.id}`}
          src={queued.videoUrl}
          preload="auto"
          muted
          playsInline
          style={{ display: "none" }}
        />
      )}
    </>
  );
}
