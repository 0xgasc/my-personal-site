"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { usePublicConfig } from "@/lib/scenes/fetcher";

interface Props {
  darkMode: boolean;
}

export default function SceneCycler({ darkMode }: Props) {
  const { scenes } = usePublicConfig();
  const { fxEnabled, setFxEnabled, currentSceneId, setCurrentSceneId } = useApp();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !scenes.length) return null;

  function cycleScene() {
    const i = Math.max(0, scenes.findIndex((s) => s.id === currentSceneId));
    const next = scenes[(i + 1) % scenes.length];
    setCurrentSceneId(next.id);
  }

  return (
    <>
      <button
        onClick={() => setFxEnabled(!fxEnabled)}
        className={`btn-ghost ${fxEnabled ? "active" : ""}`}
        aria-label="Toggle background FX"
        title={fxEnabled ? "Hide background FX" : "Show background FX"}
      >
        {fxEnabled ? "FX" : "fx"}
      </button>
      {scenes.length > 1 && fxEnabled && (
        <button onClick={cycleScene} className="btn-ghost" aria-label="Next scene" title="Next scene">
          →
        </button>
      )}
    </>
  );
}
