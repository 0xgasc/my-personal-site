/**
 * Remote (cross-origin) videos go through the same-origin /api/video proxy so
 * WebGL can read their frames without tainting the canvas. Local /public
 * files pass through unchanged.
 */
export function resolveVideoSrc(src: string): string {
  if (typeof window === "undefined") return src;
  try {
    const parsed = new URL(src, window.location.href);
    if (parsed.origin !== window.location.origin) {
      return `/api/video?url=${encodeURIComponent(src)}`;
    }
  } catch {
    // not a parseable URL — leave as-is
  }
  return src;
}
