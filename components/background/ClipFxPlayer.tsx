"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import FxCanvas from "./FxCanvas";
import type { Clip } from "@/lib/clips/types";

/** iOS Safari composites WebGL canvases on a separate GPU layer that
 *  CSS transparency cannot sample. Use a plain <video> there so the
 *  glass card can genuinely show through. */
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
  /** Notified when the active clip changes (used by BackgroundMount). */
  onActiveClipChange?: (clip: Clip | null) => void;
}

const HARD_MAX_SEGMENT_SEC = 30;

export const NEXT_CLIP_EVENT = "clip:next";

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

  const [active, setActive] = useState<Clip | null>(() =>
    clips.length ? pickClip(clips) : null
  );
  const [jumpKey, setJumpKey] = useState(0);
  const [seekTarget, setSeekTarget] = useState<number>(() =>
    active ? computeStartSec(active) : 0
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      <video
        key={`${active.id}:${jumpKey}`}
        src={active.videoUrl}
        autoPlay
        muted
        playsInline
        loop
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex,
          pointerEvents: "none",
        }}
      />
    );
  }

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
