"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import RemixStudio, { type RemixStrings } from "./RemixStudio";
import { shadedBackdropStyle, BackdropGrain, useModalOpen } from "./ShadedBackdrop";

/**
 * The shaders can only read images that are same-origin or CORS-enabled.
 * Local files, the weserv proxy and Supabase storage are; anything else on
 * https is routed through weserv. Returns null when it can't be remixed.
 */
export function remixSource(src: string | undefined): string | null {
  if (!src) return null;
  if (src.startsWith("/") && !src.startsWith("//")) return src;
  try {
    const u = new URL(src);
    if (u.hostname === "images.weserv.nl" || u.hostname.endsWith(".supabase.co")) return src;
    if (u.protocol !== "https:") return null;
    return `https://images.weserv.nl/?url=${encodeURIComponent(src)}&w=1600&output=jpg&q=90`;
  } catch {
    return null;
  }
}

export interface LightboxItem {
  /** Thumbnail src used in the grid. */
  src: string;
  /** Optional full-resolution src for the lightbox. Falls back to `src`. */
  full?: string;
  alt: string;
  title?: string;
  link?: string;
}

interface Props {
  items: LightboxItem[];
  /** Index to open, or null to close */
  initialIndex?: number | null;
  onClose: () => void;
  /** Optional translated strings (falls back to English). */
  strings?: {
    loading?: string;
    falling?: string;
    cannotLoad?: string;
    viewOnChain?: string;
    remix?: string;
    back?: string;
  } & Partial<RemixStrings>;
}

/**
 * Full-screen art lightbox with keyboard navigation, swipe gestures,
 * and smooth framer-motion transitions.
 */
export default function Lightbox({ items, initialIndex, onClose, strings }: Props) {
  const s = {
    loading: strings?.loading ?? "loading…",
    falling: strings?.falling ?? "falling back to thumb…",
    cannotLoad: strings?.cannotLoad ?? "Image couldn't load.",
    viewOnChain: strings?.viewOnChain ?? "View on chain ↗",
    remix: strings?.remix ?? "remix",
    back: strings?.back ?? "back",
  };
  const remixStrings: RemixStrings = {
    wet: strings?.wet ?? "wet",
    amount: strings?.amount ?? "amount",
    palette: strings?.palette ?? "palette",
    save: strings?.save ?? "save",
    submit: strings?.submit ?? "submit to guestbook",
    name: strings?.name ?? "name",
    note: strings?.note ?? "note (optional)",
    send: strings?.send ?? "send",
    sending: strings?.sending ?? "sending…",
    sent: strings?.sent ?? "sent — it shows after review",
    failed: strings?.failed ?? "couldn't send, try again",
  };
  const [remixing, setRemixing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex ?? 0);
  const [loaded, setLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  /** Tracks whether we've already fallen back to the thumbnail src so we
   *  don't loop between full / thumb if both fail. */
  const [usingFallback, setUsingFallback] = useState(false);
  /** Force-show after N seconds even if onLoad never fires. Some Tezos GIFs
   *  do fire onLoad eventually but the browser stutters; flip the spinner
   *  off so the user at least sees whatever is decoding. */
  useEffect(() => {
    setLoaded(false);
    setImageError(false);
    setUsingFallback(false);
    setRemixing(false);
    const id = setTimeout(() => setLoaded(true), 8000);
    return () => clearTimeout(id);
  }, [currentIndex]);

  // Sync initialIndex
  useEffect(() => {
    if (initialIndex !== null && initialIndex !== undefined) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex]);

  const current = items[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < items.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) {
      setLoaded(false);
      setCurrentIndex((i) => i - 1);
    }
  }, [hasPrev]);

  const goNext = useCallback(() => {
    if (hasNext) {
      setLoaded(false);
      setCurrentIndex((i) => i + 1);
    }
  }, [hasNext]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Leave arrow keys to sliders and text fields.
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, goPrev, goNext]);

  useModalOpen(true);

  // Swipe left/right on touch screens (off while remixing: sliders need the drag).
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    if (remixing || e.touches.length !== 1) return;
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start || remixing) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < 0) goNext();
    else goPrev();
  };

  const isOpen = initialIndex !== null && initialIndex !== undefined;
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  // Mount the lightbox at document.body so its `position: fixed`
  // escapes any ancestor that creates a containing block (the page's
  // glass-card uses backdrop-filter, which per CSS spec turns into a
  // containing block for fixed children — that's why the lightbox was
  // being clipped to the card's size instead of covering the viewport).
  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  if (!portalTarget) return null;

  const tree = (
    <AnimatePresence>
      {isOpen && current && (
        <motion.div
          key="lightbox-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center max-sm:px-4 max-sm:pt-16 max-sm:pb-12"
          style={shadedBackdropStyle}
          onClick={onClose}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <BackdropGrain />
          {/* Image container */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative max-w-[90vw] max-h-[92vh] max-sm:max-w-full max-sm:max-h-full overflow-y-auto overscroll-contain flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {remixing && (
              <RemixStudio
                src={remixSource(current.full && !usingFallback ? current.full : current.src)!}
                title={current.title ?? current.alt}
                link={current.link}
                strings={remixStrings}
              />
            )}
            {/* Image */}
            <div className={`relative flex items-center justify-center ${remixing ? "hidden" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  usingFallback || !current.full
                    ? current.src
                    : current.full
                }
                alt={current.alt}
                onLoad={() => {
                  setLoaded(true);
                  setImageError(false);
                }}
                onError={() => {
                  // Full URL failed — fall back to the thumb so the user at
                  // least sees something.
                  if (!usingFallback && current.full && current.full !== current.src) {
                    setUsingFallback(true);
                  } else {
                    setImageError(true);
                    setLoaded(true);
                  }
                }}
                className={`max-w-full max-h-[75vh] rounded-lg shadow-2xl transition-opacity duration-300 ${
                  loaded ? "opacity-100" : "opacity-0"
                }`}
                style={{ objectFit: "contain" }}
              />

              {/* Loading skeleton */}
              {!loaded && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg overflow-hidden"
                  style={{
                    minWidth: "min(60vw, 480px)",
                    minHeight: "min(50vh, 360px)",
                    background:
                      "linear-gradient(110deg, rgba(255,255,255,0.04) 8%, rgba(255,255,255,0.10) 18%, rgba(255,255,255,0.04) 33%)",
                    backgroundSize: "200% 100%",
                    animation: "lightboxShimmer 1.4s linear infinite",
                  }}
                >
                  <span className="text-[10px] uppercase tracking-widest text-white/40">
                    {usingFallback ? s.falling : s.loading}
                  </span>
                </div>
              )}
              {imageError && loaded && (
                <div className="text-center text-white/70 text-sm py-12 px-6">
                  <p>{s.cannotLoad}</p>
                  {current.link && (
                    <a
                      href={current.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-3 text-white/80 underline text-xs"
                    >
                      {s.viewOnChain}
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Caption */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
            >
              {current.title && (
                <span className="text-white/80 text-sm font-medium tracking-wide">
                  {current.title}
                </span>
              )}
              {current.link && (
                <a
                  href={current.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/50 hover:text-white text-xs underline underline-offset-2 transition-colors"
                >
                  {s.viewOnChain}
                </a>
              )}
              {remixSource(current.full && !usingFallback ? current.full : current.src) && !imageError && (
                <button
                  type="button"
                  onClick={() => setRemixing((r) => !r)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    remixing
                      ? "border-white/30 text-white/70 hover:text-white"
                      : "bg-white text-black border-white hover:bg-white/85"
                  }`}
                >
                  {remixing ? s.back : s.remix}
                </button>
              )}
              <span className="text-white/30 text-xs">
                {currentIndex + 1} / {items.length}
              </span>
            </motion.div>
          </motion.div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="fixed top-6 right-6 max-sm:top-3 max-sm:right-3 z-[110] w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all backdrop-blur-md"
            aria-label="Close lightbox"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3l12 12M15 3L3 15" />
            </svg>
          </button>

          {/* Prev / Next arrows */}
          {hasPrev && !remixing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="max-sm:hidden fixed left-6 top-1/2 -translate-y-1/2 z-[110] w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all backdrop-blur-md"
              aria-label="Previous"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 4l-6 6 6 6" />
              </svg>
            </button>
          )}
          {hasNext && !remixing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="max-sm:hidden fixed right-6 top-1/2 -translate-y-1/2 z-[110] w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all backdrop-blur-md"
              aria-label="Next"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 4l6 6-6 6" />
              </svg>
            </button>
          )}

          {/* Dots at bottom */}
          <div className={`fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[110] flex ${remixing ? "hidden" : ""}`}>
            {items.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setLoaded(false);
                  setCurrentIndex(i);
                }}
                className="group h-8 px-1 flex items-center"
                aria-label={`Go to image ${i + 1}`}
              >
                <span
                  className={`block h-2 rounded-full transition-all duration-300 ${
                    i === currentIndex ? "bg-white w-6" : "w-2 bg-white/30 group-hover:bg-white/50"
                  }`}
                />
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(tree, portalTarget);
}
