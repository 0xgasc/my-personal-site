"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { shadedBackdropStyle, BackdropGrain } from "./ShadedBackdrop";

export interface SiteModalItem {
  title: string;
  /** Page shown live in the frame. The site must allow s-o-l-o.xyz in frame-ancestors. */
  url: string;
  /** Where "open site" goes; defaults to `url`. */
  link?: string;
}

interface Props {
  site: SiteModalItem | null;
  onClose: () => void;
  strings?: { open?: string; close?: string };
}

/** A project's live site, interactive, in a shaded modal. */
export default function SiteModal({ site, onClose, strings }: Props) {
  const [portal, setPortal] = useState<HTMLElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => setPortal(document.body), []);
  useEffect(() => setLoaded(false), [site?.url]);

  useEffect(() => {
    if (!site) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [site, onClose]);

  if (!portal) return null;

  return createPortal(
    <AnimatePresence>
      {site && (
        <motion.div
          key="site-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-8"
          style={shadedBackdropStyle}
          onClick={onClose}
        >
          <BackdropGrain />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative flex flex-col w-full max-w-6xl h-full max-h-[88vh] rounded-xl overflow-hidden"
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 30px 120px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)",
              background: "rgba(10,10,12,0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 px-4 py-2.5 text-sm text-white/80 border-b border-white/10">
              <span className="truncate">{site.title}</span>
              <a
                href={site.link ?? site.url}
                target="_blank"
                rel="noreferrer"
                className="ml-auto shrink-0 text-xs text-white/55 hover:text-white"
              >
                {strings?.open ?? "open site ↗"}
              </a>
              <button
                type="button"
                onClick={onClose}
                aria-label={strings?.close ?? "close"}
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
              >
                <svg width="12" height="12" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3l12 12M15 3L3 15" />
                </svg>
              </button>
            </div>
            <div className="relative flex-1 bg-black/30">
              {!loaded && (
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(110deg, rgba(255,255,255,0.03) 8%, rgba(255,255,255,0.08) 18%, rgba(255,255,255,0.03) 33%)",
                    backgroundSize: "200% 100%",
                    animation: "lightboxShimmer 1.4s linear infinite",
                  }}
                />
              )}
              <iframe
                key={site.url}
                src={site.url}
                title={site.title}
                onLoad={() => setLoaded(true)}
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture; clipboard-write"
                className="absolute inset-0 w-full h-full"
                style={{ border: 0, opacity: loaded ? 1 : 0, transition: "opacity 300ms" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    portal,
  );
}
