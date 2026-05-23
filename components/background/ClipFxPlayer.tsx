"use client";

import { useEffect, useRef, useState } from "react";
import FxCanvas from "./FxCanvas";
import type { Clip } from "@/lib/clips/types";

interface Props {
  clips: Clip[];
  zIndex?: number;
  /** Notified when the active clip changes (used by BackgroundMount). */
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

function computeStartSec(clip: Clip): number {
  // We don't know the video duration upfront, so we provide a "target"
  // and FxCanvas clamps it to (duration - 0.1) on loadedmetadata.
  switch (clip.startMode) {
    case "fixed":
      return Math.max(0, clip.startFixedSec ?? 0);
    case "window": {
      const lo = Math.max(0, clip.startWindowMinSec ?? 0);
      const hi = Math.max(lo, clip.startWindowMaxSec ?? lo + 30);
      return lo + Math.random() * (hi - lo);
    }
    default:
      // "random" — let the duration clamp it. Provide a wide upper bound.
      return Math.random() * 600;
  }
}

/**
 * Drives weighted clip rotation + random-jump seeks through a shared
 * FxCanvas instance. Each clip carries its own shader mode + params,
 * which flow through to the canvas as the active clip swaps.
 */
export default function ClipFxPlayer({ clips, zIndex = -2, onActiveClipChange }: Props) {
  const [active, setActive] = useState<Clip | null>(() =>
    clips.length ? pickWeighted(clips) : null
  );
  /** Incrementing counter that force-remounts FxCanvas on every jump. */
  const [jumpKey, setJumpKey] = useState(0);
  const [seekTarget, setSeekTarget] = useState<number>(() =>
    active ? computeStartSec(active) : 0
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // If the input `clips` list changes (rare — public list refresh),
  // make sure the active clip still exists.
  useEffect(() => {
    if (!active) {
      if (clips.length) {
        const next = pickWeighted(clips);
        setActive(next);
        setSeekTarget(computeStartSec(next));
        setJumpKey((k) => k + 1);
      }
      return;
    }
    if (!clips.find((c) => c.id === active.id)) {
      const next = clips.length ? pickWeighted(clips) : null;
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

  // Schedule the next jump / clip swap.
  useEffect(() => {
    if (!active) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const minS = active.segmentMinSec;
    const maxS = Math.max(minS + 1, active.segmentMaxSec);
    const ms = (minS + Math.random() * (maxS - minS)) * 1000;
    timeoutRef.current = setTimeout(() => {
      if (clips.length > 1 && Math.random() < 0.5) {
        // Rotate to a different clip.
        const next = pickWeighted(clips, active.id);
        setActive(next);
        setSeekTarget(computeStartSec(next));
      } else {
        // Stay on the same clip, jump to a new random spot within it.
        setSeekTarget(computeStartSec(active));
      }
      setJumpKey((k) => k + 1);
    }, ms);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [active, jumpKey, clips]);

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
