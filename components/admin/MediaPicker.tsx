"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import StashUpload from "./StashUpload";
import type { MediaEntry } from "@/lib/cms/store";

interface Props {
  /** Current value (URL) so we can show what's selected. */
  value?: string;
  onPick: (url: string, alt?: string) => void;
  onClose: () => void;
}

/**
 * Modal that lists every row from /admin/media, plus a Stash uploader
 * inline so you can drop a new file without leaving the section editor.
 * Picking a row fires onPick(url, alt) and closes.
 */
export default function MediaPicker({ value, onPick, onClose }: Props) {
  const [rows, setRows] = useState<MediaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [newKey, setNewKey] = useState("");
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTarget(document.body);
    fetch("/api/admin/media")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setRows(j?.rows ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!target) return null;

  const filtered = rows.filter((r) => {
    if (!filter.trim()) return true;
    const q = filter.toLowerCase();
    return r.key.toLowerCase().includes(q) || r.url.toLowerCase().includes(q);
  });

  async function saveAndPick(url: string) {
    if (!newKey || !url) return;
    try {
      const r = await fetch("/api/admin/media", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key: newKey, url, alt: "" }),
      });
      if (r.ok) {
        const j = await r.json();
        const entry = j.entry as MediaEntry;
        onPick(entry.url, entry.alt);
      }
    } catch {
      // ignore
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="bg-gray-950 border border-gray-800 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-base font-semibold text-gray-100">Pick media</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-sm uppercase tracking-widest"
          >
            close ×
          </button>
        </div>

        <div className="p-4 space-y-3 border-b border-gray-800">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="filter by key or url…"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm"
          />
          <div className="bg-gray-900 border border-gray-800 rounded-md p-3 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-gray-500">
              Or upload + assign a key
            </p>
            <input
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="key (e.g. about.headshot)"
              className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1 text-sm font-mono"
            />
            <StashUpload currentUrl={null} onUploaded={(url) => saveAndPick(url)} onClear={() => {}} />
          </div>
        </div>

        <div className="overflow-y-auto p-4 flex-1">
          {loading ? (
            <p className="text-sm text-gray-500">loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-500">no media yet — upload above.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map((r) => {
                const isSelected = r.url === value;
                return (
                  <button
                    key={r.key}
                    onClick={() => onPick(r.url, r.alt)}
                    className={`text-left bg-gray-900 border-2 rounded-md overflow-hidden transition-all hover:border-amber-500 ${
                      isSelected ? "border-amber-500" : "border-gray-800"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.url}
                      alt={r.alt}
                      className="w-full aspect-square object-cover bg-gray-800"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
                      }}
                    />
                    <div className="p-2">
                      <div className="text-xs font-mono text-amber-400 truncate">{r.key}</div>
                      {r.alt && <div className="text-[10px] text-gray-500 truncate">{r.alt}</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    target
  );
}
