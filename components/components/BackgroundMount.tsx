"use client";

import { usePublicConfig } from "@/lib/scenes/fetcher";
import SceneBackground from "@/components/background/SceneBackground";
import GenerativeShader from "@/components/background/GenerativeShader";
import YouTubeBackground from "@/components/background/YouTubeBackground";
import { useApp } from "@/contexts/AppContext";

const YT_BG_ID = process.env.NEXT_PUBLIC_YOUTUBE_BG_ID;

/**
 * Client-only mount that fetches public scenes + settings and renders:
 * 1. A generative shader background (always on, ambient layer)
 * 2. The scene-based video background on top (when scenes exist)
 *
 * Always covers the full viewport behind content.
 *
 * If the URL contains ?preview=<id>, fetches that one scene from the
 * admin-gated preview endpoint and shows ONLY it.
 */
export default function BackgroundMount() {
  const { scenes, settings, loading, isPreview } = usePublicConfig();
  const { fxEnabled } = useApp();

  if (loading) return null;

  const hasYouTube = Boolean(YT_BG_ID);

  return (
    <>
      {/* Layer 0: YouTube random-jump background (when env var is set) */}
      {fxEnabled && hasYouTube && (
        <YouTubeBackground videoId={YT_BG_ID!} zIndex={-2} />
      )}

      {/* Layer 1: Generative ambient shader. When YT is the backdrop,
          this layer becomes a translucent FX overlay via blend mode so
          the trippy aesthetic stacks ON TOP of the video. Otherwise it
          renders opaque as the standalone backdrop. */}
      {fxEnabled && (
        <GenerativeShader overlay={hasYouTube} />
      )}

      {/* Layer 2: Scene video backgrounds (when scenes exist) */}
      <SceneBackground
        scenes={scenes}
        rotationMode={isPreview ? "single" : settings.rotationMode}
        rotationIntervalSec={settings.rotationIntervalSec}
        masterEnabled={settings.masterFxEnabled}
      />

      {isPreview && (
        <div
          style={{
            position: "fixed",
            top: 14,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 60,
            padding: "6px 14px",
            background: "rgba(245, 158, 11, 0.95)",
            color: "#1f1300",
            fontSize: 12,
            fontFamily: "ui-monospace, monospace",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            borderRadius: 999,
            pointerEvents: "none",
          }}
        >
          Preview · {scenes[0]?.name ?? "scene"}
        </div>
      )}
    </>
  );
}
