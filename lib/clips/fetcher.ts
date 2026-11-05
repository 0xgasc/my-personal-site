"use client";

import { useEffect, useState } from "react";
import type { Clip } from "./types";

/**
 * Resolves true if the browser can load the video's metadata, false on
 * error or after `timeoutMs`. Used to drop clips whose file has vanished
 * (e.g. expired devnet uploads) so the background never sits on black.
 */
function canPlay(url: string, timeoutMs = 8000): Promise<boolean> {
  return new Promise((resolve) => {
    if (!url) return resolve(false);
    const v = document.createElement("video");
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      v.removeAttribute("src");
      v.load();
      resolve(ok);
    };
    const timer = setTimeout(() => finish(false), timeoutMs);
    v.muted = true;
    v.preload = "metadata";
    v.onloadedmetadata = () => finish(true);
    v.onerror = () => finish(false);
    v.src = url;
  });
}

/**
 * Client-side fetcher for the public clip list. Used by BackgroundMount.
 * Only clips whose video actually loads are returned.
 */
export function usePublicClips() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    fetch("/api/clips/public")
      .then((r) => (r.ok ? r.json() : null))
      .then(async (json) => {
        const all = (json?.clips ?? []) as Clip[];
        const ok = await Promise.all(all.map((c) => canPlay(c.videoUrl)));
        if (!cancel) setClips(all.filter((_, i) => ok[i]));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancel) setLoading(false);
      });
    return () => {
      cancel = true;
    };
  }, []);

  return { clips, loading };
}
