"use client";

import { useState } from "react";
import GlassShader from "@/components/background/GlassShader";
import YouTubeBackground from "@/components/background/YouTubeBackground";
import ClipFxPlayer from "@/components/background/ClipFxPlayer";
import DitherOverlay from "@/components/background/DitherOverlay";
import { usePublicClips } from "@/lib/clips/fetcher";
import { useApp } from "@/contexts/AppContext";
import type { Clip } from "@/lib/clips/types";

const YT_BG_ID = process.env.NEXT_PUBLIC_YOUTUBE_BG_ID;

/**
 * Background stack:
 *   - Layer -2: chosen backdrop
 *       Priority: Supabase clips whose video actually loads (with full
 *       per-clip shader mode) → glass shader (random preset per visit).
 *       The glass shows while clips are checked.
 *   - Layer -1: dither overlay (procedural Bayer-RGB-split). Per-active-clip
 *       overrides — intensity, blend mode — flow in via ClipFxPlayer.
 */
export default function BackgroundMount() {
  const { clips, loading } = usePublicClips();
  const { fxEnabled } = useApp();
  const [activeClip, setActiveClip] = useState<Clip | null>(null);

  const hasClips = !loading && clips.length > 0;
  const hasYouTube = Boolean(YT_BG_ID);
  // YouTube is opt-in only (NEXT_PUBLIC_YOUTUBE_BG_FORCE=1); the glass
  // shader is the default fallback when no clip can play.
  const forceYouTube = hasYouTube && process.env.NEXT_PUBLIC_YOUTUBE_BG_FORCE === "1";
  const backdrop: "clips" | "yt" | "glass" = hasClips
    ? "clips"
    : forceYouTube && !loading
      ? "yt"
      : "glass";

  // Per-active-clip dither overlay overrides.
  const ditherIntensity = activeClip?.fxDitherIntensity ?? 1;
  const ditherBlend = (activeClip?.fxBlendMode ?? "overlay") as React.CSSProperties["mixBlendMode"];

  return (
    <>
      {fxEnabled && backdrop === "clips" && (
        <ClipFxPlayer clips={clips} zIndex={0} onActiveClipChange={setActiveClip} />
      )}
      {fxEnabled && backdrop === "yt" && (
        <YouTubeBackground videoId={YT_BG_ID!} zIndex={0} />
      )}
      {fxEnabled && backdrop === "glass" && <GlassShader zIndex={0} />}

      {/* The glass carries its own grain + aberration; dither only over video. */}
      {fxEnabled && backdrop !== "glass" && (
        <DitherOverlay zIndex={1} blendMode={ditherBlend} opacity={ditherIntensity} />
      )}

    </>
  );
}
