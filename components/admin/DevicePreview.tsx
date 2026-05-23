"use client";

import { useState, useMemo, useEffect } from "react";

type Device = "mobile" | "desktop" | "both";

interface Props {
  clipId: string;
  /** Bumps a query param so the iframe reloads when an edit happens. */
  revKey?: number;
}

const FRAMES = {
  mobile: { w: 390, h: 740, label: "iPhone · 390×740" },
  desktop: { w: 1280, h: 720, label: "Desktop · 1280×720" },
};

export default function DevicePreview({ clipId, revKey = 0 }: Props) {
  const [device, setDevice] = useState<Device>("both");
  const [maxW, setMaxW] = useState<number>(900);

  // Track container width so frames scale to fit.
  useEffect(() => {
    const update = () => {
      const w = Math.min(window.innerWidth - 380, 1100);
      setMaxW(Math.max(360, w));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const src = useMemo(() => `/admin/preview/${clipId}?v=${revKey}`, [clipId, revKey]);

  function frame(d: "mobile" | "desktop", scale: number) {
    const spec = FRAMES[d];
    const scaledW = spec.w * scale;
    const scaledH = spec.h * scale;
    return (
      <div
        key={d}
        className="flex flex-col items-center gap-2"
        style={{ width: scaledW }}
      >
        <span className="text-[10px] uppercase tracking-widest text-gray-500">
          {spec.label}
        </span>
        <div
          style={{
            width: scaledW,
            height: scaledH,
            borderRadius: d === "mobile" ? 28 : 8,
            overflow: "hidden",
            background: "#000",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            position: "relative",
          }}
        >
          <iframe
            src={src}
            title={`${d} preview`}
            style={{
              border: "none",
              width: spec.w,
              height: spec.h,
              transform: `scale(${scale})`,
              transformOrigin: "0 0",
              pointerEvents: "auto",
            }}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    );
  }

  // Compute scale so both frames fit side-by-side when device=both.
  let mobileScale: number;
  let desktopScale: number;
  if (device === "both") {
    // 12px gap between frames
    desktopScale = Math.min(0.55, (maxW - 12 - 240) / FRAMES.desktop.w);
    desktopScale = Math.max(0.32, desktopScale);
    mobileScale = Math.min(0.55, (desktopScale * 1.55) / 1);
  } else if (device === "mobile") {
    mobileScale = Math.min(0.85, maxW / FRAMES.mobile.w);
  } else {
    desktopScale = Math.min(0.9, maxW / FRAMES.desktop.w);
    mobileScale = 0;
  }
  // Safety fallback
  if (device === "mobile" && !desktopScale!) desktopScale = 0;
  if (device === "desktop" && !mobileScale!) mobileScale = 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-widest text-gray-500 mr-2">
          Preview
        </span>
        {(["mobile", "desktop", "both"] as Device[]).map((d) => (
          <button
            key={d}
            onClick={() => setDevice(d)}
            className={`px-2.5 py-1 rounded text-[10px] uppercase tracking-widest border ${
              device === d
                ? "bg-amber-500 text-black border-amber-500"
                : "bg-gray-900 border-gray-700 hover:border-gray-500 text-gray-300"
            }`}
          >
            {d}
          </button>
        ))}
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="ml-auto px-2.5 py-1 rounded text-[10px] uppercase tracking-widest bg-gray-900 border border-gray-700 hover:border-gray-500 text-gray-300"
        >
          ↗ open
        </a>
      </div>
      <div className="flex items-start gap-3 flex-wrap">
        {device !== "desktop" && frame("mobile", mobileScale!)}
        {device !== "mobile" && frame("desktop", desktopScale!)}
      </div>
    </div>
  );
}
