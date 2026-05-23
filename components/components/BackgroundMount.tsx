"use client";

import { useState } from "react";
import GenerativeShader from "@/components/background/GenerativeShader";
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
 *       Priority: Supabase clips (with full per-clip shader mode) → YouTube
 *       env-var fallback → generative beach/city scene shader.
 *   - Layer -1: dither overlay (procedural Bayer-RGB-split). Per-active-clip
 *       overrides — intensity, blend mode — flow in via ClipFxPlayer.
 */
export default function BackgroundMount() {
  const { clips, loading } = usePublicClips();
  const { fxEnabled } = useApp();
  const [activeClip, setActiveClip] = useState<Clip | null>(null);

  if (loading) return null;

  const hasClips = clips.length > 0;
  const hasYouTube = Boolean(YT_BG_ID);
  const backdrop: "clips" | "yt" | "scene" = hasClips
    ? "clips"
    : hasYouTube
      ? "yt"
      : "scene";

  // Per-active-clip dither overlay overrides.
  const ditherIntensity = activeClip?.fxDitherIntensity ?? 1;
  const ditherBlend = (activeClip?.fxBlendMode ?? "overlay") as React.CSSProperties["mixBlendMode"];

  return (
    <>
      {fxEnabled && backdrop === "clips" && (
        <ClipFxPlayer clips={clips} zIndex={-2} onActiveClipChange={setActiveClip} />
      )}
      {fxEnabled && backdrop === "yt" && (
        <YouTubeBackground videoId={YT_BG_ID!} zIndex={-2} />
      )}
      {fxEnabled && backdrop === "scene" && <GenerativeShader />}

      {fxEnabled && (
        <DitherOverlay zIndex={-1} blendMode={ditherBlend} opacity={ditherIntensity} />
      )}
    </>
  );
}
