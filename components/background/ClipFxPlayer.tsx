"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import FxCanvas from "./FxCanvas";
import type { Clip } from "@/lib/clips/types";

interface Props {
  clips: Clip[];
  zIndex?: number;
  /** Notified when the active clip changes (used by BackgroundMount). */
  onActiveClipChange?: (clip: Clip | null) => void;
}

/** Hard cap on how long any single clip plays before rotating, regardless
 *  of its segmentMaxSec setting. Keeps the bg feeling restless + magical. */
const HARD_MAX_SEGMENT_SEC = 30;

/** Custom DOM event a UI button anywhere on the page can fire to force
 *  an immediate clip rotation. */
export const NEXT_CLIP_EVENT = "clip:next";

/**
 * Uniform random pick across all clips — every clip has equal chance of
 * being chosen (when weight defaults to 1). We deliberately don't exclude
 * the current clip from the pool: a re-pick of the same clip just means
 * "jump to a new random spot in it", which keeps the per-clip frequency
 * stat truly uniform.
 */
function pickClip(clips: Clip[]): Clip {
  const total = clips.reduce((s, c) => s + Math.max(1, c.weight), 0);
  let r = Math.random() * total;
  for (const c of clips) {
    r -= Math.max(1, c.weight);
    if (r <= 0) return c;
  }
  return clips[clips.length - 1];
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
      // "random" — let FxCanvas's loadedmetadata clamp it to (duration - 0.1).
      return Math.random() * 600;
  }
}

/** How long this segment plays before the next jump fires. Clamped to
 *  [3, HARD_MAX_SEGMENT_SEC] regardless of the clip's stored values. */
function computeSegmentMs(clip: Clip): number {
  const minS = Math.max(3, Math.min(HARD_MAX_SEGMENT_SEC, clip.segmentMinSec));
  const maxS = Math.max(minS, Math.min(HARD_MAX_SEGMENT_SEC, clip.segmentMaxSec));
  return (minS + Math.random() * (maxS - minS)) * 1000;
}

export default function ClipFxPlayer({ clips, zIndex = -2, onActiveClipChange }: Props) {
  const [active, setActive] = useState<Clip | null>(() =>
    clips.length ? pickClip(clips) : null
  );
  /** Incrementing counter that force-remounts FxCanvas on every jump. */
  const [jumpKey, setJumpKey] = useState(0);
  const [seekTarget, setSeekTarget] = useState<number>(() =>
    active ? computeStartSec(active) : 0
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // If the input `clips` list changes (rare — public list refresh), make
  // sure the active clip still exists.
  useEffect(() => {
    if (!active) {
      if (clips.length) {
        const next = pickClip(clips);
        setActive(next);
        setSeekTarget(computeStartSec(next));
        setJumpKey((k) => k + 1);
      }
      return;
    }
    if (!clips.find((c) => c.id === active.id)) {
      const next = clips.length ? pickClip(clips) : null;
      setActive(next);
      if (next) {
        setSeekTarget(computeStartSec(next));
        setJumpKey((k) => k + 1);
      }
    }
  }, [clips, active]);

  // Notify parent of active-clip changes.
  useEffect(() => {
    onActiveClipChange?.(active);
  }, [active, onActiveClipChange]);

  const triggerJump = useCallback(() => {
    if (!clips.length) return;
    const next = pickClip(clips);
    setActive(next);
    setSeekTarget(computeStartSec(next));
    setJumpKey((k) => k + 1);
  }, [clips]);

  // Auto-jump scheduler.
  useEffect(() => {
    if (!active) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const ms = computeSegmentMs(active);
    timeoutRef.current = setTimeout(triggerJump, ms);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [active, jumpKey, triggerJump]);

  // Listen for the global "skip" event from the easter button (or any UI
  // that wants to nudge the rotation).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => triggerJump();
    window.addEventListener(NEXT_CLIP_EVENT, handler);
    return () => window.removeEventListener(NEXT_CLIP_EVENT, handler);
  }, [triggerJump]);

  if (!active) return null;

  return (
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
  );
}
