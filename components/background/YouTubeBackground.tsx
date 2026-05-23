"use client";

import { useEffect, useRef } from "react";

interface Props {
  videoId: string;
  minSegmentSec?: number;
  maxSegmentSec?: number;
  zIndex?: number;
}

/**
 * Full-viewport YouTube backdrop with collage behavior:
 *   - Initial random start offset
 *   - Every 6–22 s (random), jumps to a different random timestamp
 *   - Loops forever via the `playlist=ID` trick + manual jumps
 *
 * Uses a plain <iframe> with the embed URL (more permissive than the
 * IFrame Player API which often rejects valid videos with a misleading
 * "Invalid video id" error). Sends seekTo commands via postMessage —
 * works as long as `enablejsapi=1` is in the URL.
 */
export default function YouTubeBackground({
  videoId,
  minSegmentSec = 6,
  maxSegmentSec = 22,
  zIndex = -2,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const durationRef = useRef<number>(0);

  useEffect(() => {
    let mounted = true;

    function postCommand(func: string, args: unknown[] = []) {
      const w = iframeRef.current?.contentWindow;
      if (!w) return;
      w.postMessage(
        JSON.stringify({ event: "command", func, args }),
        "https://www.youtube.com"
      );
    }

    function jumpToRandom() {
      if (!mounted) return;
      // Fall back to a 4-minute guess if we never learned the real duration.
      const dur = durationRef.current > 8 ? durationRef.current : 240;
      const target = Math.random() * Math.max(0, dur - 6);
      postCommand("seekTo", [target, true]);
      postCommand("playVideo");
      scheduleJump();
    }

    function scheduleJump() {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const ms =
        (minSegmentSec + Math.random() * Math.max(0, maxSegmentSec - minSegmentSec)) *
        1000;
      timeoutRef.current = setTimeout(jumpToRandom, ms);
    }

    // Listen for state events from the iframe so we can:
    //   (a) capture the real video duration
    //   (b) re-jump when the video ends naturally
    function onMessage(e: MessageEvent) {
      if (typeof e.data !== "string") return;
      if (!e.origin.includes("youtube.com")) return;
      try {
        const msg = JSON.parse(e.data);
        if (msg?.event === "onReady") {
          postCommand("mute");
          postCommand("playVideo");
          // Request duration; will come back in onApiChange or via getDuration
          postCommand("getDuration");
          // Initial random start after a tick
          setTimeout(jumpToRandom, 800);
        }
        if (msg?.event === "onStateChange") {
          // Player state 0 = ENDED
          if (msg.info === 0) jumpToRandom();
        }
        if (msg?.event === "infoDelivery") {
          const d = msg?.info?.duration;
          if (typeof d === "number" && d > 0) durationRef.current = d;
        }
      } catch {
        // not a JSON message; ignore
      }
    }
    window.addEventListener("message", onMessage);

    // Tell the iframe to start sending events to us once it's loaded.
    function onLoad() {
      const w = iframeRef.current?.contentWindow;
      if (!w) return;
      w.postMessage(
        JSON.stringify({ event: "listening", id: videoId, channel: "widget" }),
        "https://www.youtube.com"
      );
    }
    const ifr = iframeRef.current;
    ifr?.addEventListener("load", onLoad);

    // Safety net — kick off random jumps after 3s even if onReady never fires.
    const kickoffId = setTimeout(() => {
      if (durationRef.current === 0) {
        // No metadata yet — start jumping anyway with the fallback duration.
        scheduleJump();
      }
    }, 3000);

    return () => {
      mounted = false;
      window.removeEventListener("message", onMessage);
      ifr?.removeEventListener("load", onLoad);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      clearTimeout(kickoffId);
    };
  }, [videoId, minSegmentSec, maxSegmentSec]);

  // enablejsapi=1 unlocks postMessage commands; rest is the standard
  // background-iframe cleanup. `playlist=ID` is required for `loop=1`
  // to actually loop the same video.
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const src =
    `https://www.youtube.com/embed/${videoId}` +
    `?enablejsapi=1&autoplay=1&mute=1&controls=0&modestbranding=1` +
    `&rel=0&playsinline=1&iv_load_policy=3&fs=0&disablekb=1&cc_load_policy=0` +
    `&loop=1&playlist=${videoId}` +
    (origin ? `&origin=${encodeURIComponent(origin)}` : "");

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex,
        overflow: "hidden",
        pointerEvents: "none",
        background: "#000",
      }}
    >
      <iframe
        ref={iframeRef}
        src={src}
        title="background"
        allow="autoplay; encrypted-media"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          // Overscan 1.4× the calculated cover size so YouTube's title
          // bar, watermark, and player chrome are pushed off the
          // viewport on every screen aspect ratio.
          width: "max(140vw, 248.9vh)",
          height: "max(78.75vw, 140vh)",
          transform: "translate(-50%, -50%)",
          border: "none",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
