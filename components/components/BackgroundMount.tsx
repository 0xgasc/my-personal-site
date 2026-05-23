"use client";

import { useState } from "react";
import GenerativeShader from "@/components/background/GenerativeShader";
import YouTubeBackground from "@/components/background/YouTubeBackground";
import ClipsPlayer from "@/components/background/ClipsPlayer";
import DitherOverlay from "@/components/background/DitherOverlay";
import { usePublicClips } from "@/lib/clips/fetcher";
import { useApp } from "@/contexts/AppContext";
import type { Clip, BlendMode } from "@/lib/clips/types";

const YT_BG_ID = process.env.NEXT_PUBLIC_YOUTUBE_BG_ID;

/**
 * Background stack:
 *   - Layer -2: bottom backdrop. Priority is Supabase clips → YouTube
 *     env-var fallback → generative beach/city scene shader.
 *   - Layer -1: dither overlay (procedural Bayer-RGB-split). Per-clip
 *     overrides — intensity, palette, blend mode — flow in via
 *     `onActiveClipChange` from ClipsPlayer.
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

  // Per-clip FX overrides for the dither layer.
  const ditherIntensity = activeClip?.fxDitherIntensity ?? 1;
  const ditherBlend: BlendMode = activeClip?.fxBlendMode ?? "overlay";

  return (
    <>
      {fxEnabled && backdrop === "clips" && (
        <ClipsPlayer clips={clips} zIndex={-2} onActiveClipChange={setActiveClip} />
      )}
      {fxEnabled && backdrop === "yt" && (
        <YouTubeBackground videoId={YT_BG_ID!} zIndex={-2} />
      )}
      {fxEnabled && backdrop === "scene" && <GenerativeShader />}

      {fxEnabled && (
        <DitherOverlay
          zIndex={-1}
          blendMode={ditherBlend as React.CSSProperties["mixBlendMode"]}
          opacity={ditherIntensity}
        />
      )}
    </>
  );
}
