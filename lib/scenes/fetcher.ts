"use client";

import { useEffect, useState } from "react";
import type { Scene, SiteSettings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/types";

interface PublicConfig {
  scenes: Scene[];
  settings: SiteSettings;
}

function getPreviewIdFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("preview");
}

export function usePublicConfig() {
  const [config, setConfig] = useState<PublicConfig>({
    scenes: [],
    settings: { id: "default", ...DEFAULT_SETTINGS, updatedAt: new Date().toISOString() },
  });
  const [loading, setLoading] = useState(true);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    let cancel = false;
    const previewId = getPreviewIdFromUrl();
    const url = previewId
      ? `/api/scenes/preview/${encodeURIComponent(previewId)}`
      : "/api/scenes/public";

    async function load() {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          // Preview hit may 401 if not logged in; fall back to public.
          if (previewId) {
            const fallback = await fetch("/api/scenes/public");
            if (fallback.ok && !cancel) {
              const json = (await fallback.json()) as PublicConfig;
              setConfig(json);
            }
          }
          return;
        }
        const json = (await res.json()) as PublicConfig;
        if (!cancel) {
          setConfig(json);
          setIsPreview(Boolean(previewId));
        }
      } catch {
        // silent — site renders without FX if config fails
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    load();
    return () => {
      cancel = true;
    };
  }, []);

  return { ...config, loading, isPreview };
}
