"use client";

import { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export interface LightboxItem {
  src: string;
  alt: string;
  title?: string;
  link?: string;
}

interface Props {
  items: LightboxItem[];
  /** Index to open, or null to close */
  initialIndex?: number | null;
  onClose: () => void;
}

/**
 * Full-screen art lightbox with keyboard navigation, swipe gestures,
 * and smooth framer-motion transitions.
 */
export default function Lightbox({ items, initialIndex, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex ?? 0);
  const [loaded, setLoaded] = useState(false);

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
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, goPrev, goNext]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{
            background: "rgba(0,0,0,0.92)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
          onClick={onClose}
        >
          {/* Image container */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="relative flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.src}
                alt={current.alt}
                onLoad={() => setLoaded(true)}
                className={`max-w-full max-h-[75vh] rounded-lg shadow-2xl transition-opacity duration-300 ${
                  loaded ? "opacity-100" : "opacity-0"
                }`}
                style={{ objectFit: "contain" }}
              />

              {/* Loading placeholder */}
              {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Caption */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="mt-4 flex items-center gap-4"
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
                  View on chain ↗
                </a>
              )}
              <span className="text-white/30 text-xs">
                {currentIndex + 1} / {items.length}
              </span>
            </motion.div>
          </motion.div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="fixed top-6 right-6 z-[110] w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all backdrop-blur-md"
            aria-label="Close lightbox"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3l12 12M15 3L3 15" />
            </svg>
          </button>

          {/* Prev / Next arrows */}
          {hasPrev && (
            <button
              onClick={goPrev}
              className="fixed left-6 top-1/2 -translate-y-1/2 z-[110] w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all backdrop-blur-md"
              aria-label="Previous"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 4l-6 6 6 6" />
              </svg>
            </button>
          )}
          {hasNext && (
            <button
              onClick={goNext}
              className="fixed right-6 top-1/2 -translate-y-1/2 z-[110] w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all backdrop-blur-md"
              aria-label="Next"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 4l6 6-6 6" />
              </svg>
            </button>
          )}

          {/* Dots at bottom */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] flex gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setLoaded(false);
                  setCurrentIndex(i);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "bg-white w-6"
                    : "bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(tree, portalTarget);
}
