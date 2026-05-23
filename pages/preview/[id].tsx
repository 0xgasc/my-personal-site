import Head from "next/head";
import { useEffect, useState } from "react";
import Link from "next/link";
import FxCanvas from "@/components/background/FxCanvas";
import { withAdminAuth } from "@/lib/admin/withAdminAuth";
import { getStore } from "@/lib/store";
import type { Scene } from "@/lib/types";

interface Props {
  initialScene: Scene;
}

export const getServerSideProps = withAdminAuth<Props>(async (ctx) => {
  const id = ctx.params?.id;
  if (typeof id !== "string") return { notFound: true as const };
  const store = getStore();
  const scene = await store.get(id);
  if (!scene) return { notFound: true as const };
  return {
    props: { initialScene: JSON.parse(JSON.stringify(scene)) },
  };
});

/**
 * Fullscreen scene preview — no Layout, no iframe, no chrome. Just the
 * FxCanvas at 100vw × 100vh so you can see exactly what the scene looks
 * like. Live-polls the scene API so edits in the admin tab show up here.
 */
export default function ScenePreviewPage({ initialScene }: Props) {
  const [scene, setScene] = useState<Scene>(initialScene);
  const [hideChrome, setHideChrome] = useState(false);
  const [videoState, setVideoState] = useState<"idle" | "loading" | "ready" | "error">(
    initialScene.videoUrl ? "loading" : "idle"
  );

  // Poll a hidden <video> on the side so we can show real loading state while
  // the WebGL canvas is also pulling the same URL. Not the prettiest but it's
  // the only way to surface "video is buffering" since FxCanvas has no event
  // hooks today.
  useEffect(() => {
    if (!scene.videoUrl) {
      setVideoState("idle");
      return;
    }
    setVideoState("loading");
    const probe = document.createElement("video");
    probe.muted = true;
    probe.preload = "auto";
    probe.src = (() => {
      try {
        const parsed = new URL(scene.videoUrl, window.location.href);
        return parsed.origin === window.location.origin
          ? scene.videoUrl
          : `/api/video?url=${encodeURIComponent(scene.videoUrl)}`;
      } catch {
        return scene.videoUrl;
      }
    })();
    const onCanPlay = () => setVideoState("ready");
    const onError = () => setVideoState("error");
    probe.addEventListener("canplay", onCanPlay);
    probe.addEventListener("error", onError);
    probe.load();
    return () => {
      probe.removeEventListener("canplay", onCanPlay);
      probe.removeEventListener("error", onError);
      probe.src = "";
      probe.load();
    };
  }, [scene.videoUrl]);

  // Poll the scene every 1s while the page is open so edits in the admin
  // tab reflect here without a manual refresh.
  useEffect(() => {
    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/scenes/${initialScene.id}`);
        if (!res.ok) return;
        const json = (await res.json()) as { scene: Scene };
        if (!cancelled && json.scene) setScene(json.scene);
      } catch {
        // silent
      }
    }, 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [initialScene.id]);

  return (
    <>
      <Head>
        <title>{`Preview · ${scene.name || "Scene"}`}</title>
      </Head>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: scene.themeOverride === "light" ? "#ffffff" : "#0a0a0a",
          overflow: "hidden",
          cursor: "crosshair",
        }}
      >
        <FxCanvas
          videoUrl={scene.videoUrl}
          videoOpacity={scene.videoOpacity}
          videoBlur={scene.videoBlur}
          mode={scene.fxMode}
          params={scene.fxParams}
          wet={scene.fxWet}
          hover={scene.hover}
          fixed
        />

        {!hideChrome && (
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
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            {`Preview · ${scene.name} · ${scene.fxMode} · live`}
          </div>
        )}

        {!hideChrome && scene.videoUrl && videoState !== "ready" && (
          <div
            style={{
              position: "fixed",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 60,
              padding: "10px 18px",
              background: "rgba(0,0,0,0.7)",
              color:
                videoState === "error" ? "#fbb" : videoState === "loading" ? "#ffcf6a" : "#aaa",
              fontSize: 12,
              fontFamily: "ui-monospace, monospace",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(4px)",
              maxWidth: 600,
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            {videoState === "loading" && (
              <>
                <div>buffering video…</div>
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>
                  large files (872 MB .mov) can take a minute on first load. the canvas stays
                  black until the first frame decodes.
                </div>
              </>
            )}
            {videoState === "error" && (
              <>
                <div>video failed to load</div>
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>
                  most likely codec — chromium has spotty H.265/HEVC support. try an H.264 mp4.
                </div>
              </>
            )}
          </div>
        )}

        {!hideChrome && (
          <div
            style={{
              position: "fixed",
              top: 14,
              right: 14,
              zIndex: 60,
              display: "flex",
              gap: 8,
              fontFamily: "ui-monospace, monospace",
              fontSize: 11,
            }}
          >
            <Link
              href={`/admin/scenes/${scene.id}`}
              style={{
                background: "rgba(0,0,0,0.6)",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: 999,
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(4px)",
              }}
            >
              ← edit
            </Link>
            <button
              onClick={() => setHideChrome(true)}
              style={{
                background: "rgba(0,0,0,0.6)",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.2)",
                fontFamily: "inherit",
                fontSize: "inherit",
                cursor: "pointer",
                backdropFilter: "blur(4px)",
              }}
              title="Hide chrome (press any key to bring it back)"
            >
              hide ui
            </button>
          </div>
        )}

        {hideChrome && (
          <div
            onClick={() => setHideChrome(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              cursor: "default",
            }}
            onKeyDown={() => setHideChrome(false)}
          />
        )}
      </div>
    </>
  );
}
