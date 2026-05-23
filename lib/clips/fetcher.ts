"use client";

import { useEffect, useState } from "react";
import type { Clip } from "./types";

/**
 * Client-side fetcher for the public clip list. Used by BackgroundMount.
 */
export function usePublicClips() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    fetch("/api/clips/public")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancel) return;
        if (json?.clips) setClips(json.clips as Clip[]);
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
