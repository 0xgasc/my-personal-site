"use client";

import { useEffect, useState } from "react";

interface MediaMap {
  [key: string]: { url: string; alt: string };
}

let cache: MediaMap | null = null;
let inflight: Promise<MediaMap> | null = null;
const subscribers = new Set<() => void>();

function load(): Promise<MediaMap> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  inflight = fetch("/api/media/public")
    .then((r) => (r.ok ? r.json() : null))
    .then((json) => {
      cache = (json?.media as MediaMap) ?? {};
      subscribers.forEach((cb) => cb());
      return cache;
    })
    .catch(() => {
      cache = {};
      return cache;
    });
  return inflight;
}

/**
 * Returns the override URL + alt for a media key, or the supplied defaults
 * if no override has been set in /admin/media. Subscribes to cache updates.
 */
export function useMedia(key: string, defaultUrl = "", defaultAlt = "") {
  const [, force] = useState(0);
  useEffect(() => {
    load();
    const cb = () => force((t) => t + 1);
    subscribers.add(cb);
    return () => {
      subscribers.delete(cb);
    };
  }, []);
  const entry = cache?.[key];
  return {
    url: entry?.url || defaultUrl,
    alt: entry?.alt || defaultAlt,
    overridden: Boolean(entry),
  };
}
