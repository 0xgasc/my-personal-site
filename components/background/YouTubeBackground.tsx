"use client";

import { useEffect, useRef } from "react";

interface Props {
  videoId: string;
  /** Min seconds of continuous playback before jumping to a new random spot. */
  minSegmentSec?: number;
  /** Max seconds of continuous playback before jumping. */
  maxSegmentSec?: number;
  /** Whether to start from a random offset on first load. */
  randomStart?: boolean;
  /** Z-index. Default -2 (behind everything). */
  zIndex?: number;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement | string,
        config: Record<string, unknown>
      ) => YTPlayer;
      PlayerState: { ENDED: number; PLAYING: number; PAUSED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  seekTo: (sec: number, allowSeekAhead: boolean) => void;
  getDuration: () => number;
  destroy: () => void;
}

/**
 * Full-viewport YouTube background that plays as a collage:
 *   - Starts at a random timestamp
 *   - After a random 5–25 second segment, jumps to a different random spot
 *   - Loops forever (when video ends naturally, picks a new random start too)
 *   - Muted, autoplay, no controls, no related-video overlay
 *
 * The iframe is over-sized to maintain its 16:9 aspect ratio while covering
 * the viewport, so there are no black bars regardless of window shape.
 */
export default function YouTubeBackground({
  videoId,
  minSegmentSec = 6,
  maxSegmentSec = 22,
  randomStart = true,
  zIndex = -2,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // Inject the YT IFrame API script once.
    if (!document.getElementById("yt-iframe-api")) {
      const s = document.createElement("script");
      s.id = "yt-iframe-api";
      s.src = "https://www.youtube.com/iframe_api";
      s.async = true;
      document.head.appendChild(s);
    }

    function scheduleJump() {
      if (!mountedRef.current) return;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const ms =
        (minSegmentSec + Math.random() * Math.max(0, maxSegmentSec - minSegmentSec)) *
        1000;
      timeoutRef.current = setTimeout(jumpToRandom, ms);
    }

    function jumpToRandom() {
      const p = playerRef.current;
      if (!p) return;
      let duration = 0;
      try {
        duration = p.getDuration() ?? 0;
      } catch {
        // metadata not ready yet
      }
      if (duration < 8) {
        // Try again shortly
        timeoutRef.current = setTimeout(jumpToRandom, 600);
        return;
      }
      const target = Math.random() * Math.max(0, duration - 6);
      try {
        p.seekTo(target, true);
        p.playVideo();
      } catch {
        // ignore
      }
      scheduleJump();
    }

    function createPlayer() {
      if (!window.YT?.Player || !containerRef.current) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          fs: 0,
          disablekb: 1,
          playsinline: 1,
          loop: 0, // we manage looping ourselves
          cc_load_policy: 0,
        },
        events: {
          onReady: (e: { target: YTPlayer }) => {
            try {
              e.target.mute();
              if (randomStart) {
                const dur = e.target.getDuration?.() ?? 0;
                if (dur > 8) e.target.seekTo(Math.random() * (dur - 6), true);
              }
              e.target.playVideo();
            } catch {
              // ignore
            }
            scheduleJump();
          },
          onStateChange: (e: { data: number; target: YTPlayer }) => {
            // When the video ends naturally, jump to a new random spot.
            if (e.data === window.YT?.PlayerState.ENDED) {
              jumpToRandom();
            }
          },
        },
      });
    }

    if (window.YT?.Player) {
      createPlayer();
    } else {
      // Chain the API ready callback so multiple components can coexist.
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        createPlayer();
      };
    }

    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      try {
        playerRef.current?.destroy();
      } catch {
        // ignore
      }
      playerRef.current = null;
    };
  }, [videoId, minSegmentSec, maxSegmentSec, randomStart]);

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
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          // Cover the viewport at 16:9 — whichever dimension is the constraint.
          width: "max(100vw, 177.78vh)",
          height: "max(56.25vw, 100vh)",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
