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

/** Extra pixels the background extends beyond viewport edges in every
 *  direction — gives the pan room to move without revealing empty space. */
const MAX_PAN = 220;

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

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
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

  // Drag-to-pan state — reset on every clip rotation.
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    setPan({ x: 0, y: 0 });
  }, [jumpKey]);

  // If clips list changes, keep active in sync.
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

  // ── Pan handlers ────────────────────────────────────────
  function onPointerDown(clientX: number, clientY: number) {
    dragRef.current = { startX: clientX, startY: clientY, panX: pan.x, panY: pan.y };
    isDragging.current = false;
  }
  function onPointerMove(clientX: number, clientY: number) {
    if (!dragRef.current) return;
    const dx = clientX - dragRef.current.startX;
    const dy = clientY - dragRef.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) isDragging.current = true;
    setPan({
      x: clamp(dragRef.current.panX + dx, -MAX_PAN, MAX_PAN),
      y: clamp(dragRef.current.panY + dy, -MAX_PAN, MAX_PAN),
    });
  }
  function onPointerUp() {
    dragRef.current = null;
  }

  /** Transparent overlay that sits between the background (z=0/1) and the
   *  card content (z=10). Captures drag on visible background areas only —
   *  card interaction is unaffected because the card has higher z-index. */
  const dragOverlay = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: zIndex + 2,
        cursor: isDragging.current ? "grabbing" : "grab",
        touchAction: "none",
      }}
      onMouseDown={(e) => onPointerDown(e.clientX, e.clientY)}
      onMouseMove={(e) => onPointerMove(e.clientX, e.clientY)}
      onMouseUp={onPointerUp}
      onMouseLeave={onPointerUp}
      onTouchStart={(e) => {
        const t = e.touches[0];
        onPointerDown(t.clientX, t.clientY);
      }}
      onTouchMove={(e) => {
        const t = e.touches[0];
        onPointerMove(t.clientX, t.clientY);
      }}
      onTouchEnd={onPointerUp}
    />
  );

  if (!active) return null;

  // Background is rendered oversized (MAX_PAN px beyond each edge) so
  // panning never reveals empty space.
  const bgStyle: React.CSSProperties = {
    position: "fixed",
    top: -MAX_PAN + pan.y,
    left: -MAX_PAN + pan.x,
    width: `calc(100vw + ${2 * MAX_PAN}px)`,
    height: `calc(100vh + ${2 * MAX_PAN}px)`,
    zIndex,
    pointerEvents: "none",
  };

  // iOS Safari: plain <video> — participates in CSS compositing so
  // the transparent glass card shows it through.
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
          style={{ ...bgStyle, objectFit: "cover" }}
        />
        {dragOverlay}
      </>
    );
  }

  return (
    <>
      <div style={bgStyle}>
        <FxCanvas
          key={`${active.id}:${jumpKey}`}
          videoUrl={active.videoUrl}
          videoOpacity={1}
          videoBlur={0}
          mode={active.fxMode}
          params={active.fxParams}
          wet={active.fxWet}
          hover={active.hover}
          fixed={false}
          initialSeekSec={seekTarget}
        />
      </div>
      {dragOverlay}
    </>
  );
}
