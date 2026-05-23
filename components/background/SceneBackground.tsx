"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import FxCanvas from "./FxCanvas";
import type { Scene } from "@/lib/types";

interface SceneBackgroundProps {
  scenes: Scene[];
  rotationMode: "single" | "sequential" | "random" | "stack";
  rotationIntervalSec: number;
  masterEnabled: boolean;
}

export default function SceneBackground({
  scenes,
  rotationMode,
  rotationIntervalSec,
  masterEnabled,
}: SceneBackgroundProps) {
  const { fxEnabled, currentSceneId, setCurrentSceneId } = useApp();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!scenes.length) return;
    if (currentSceneId) {
      const i = scenes.findIndex((s) => s.id === currentSceneId);
      if (i >= 0) setIndex(i);
      else setIndex(0);
    }
  }, [currentSceneId, scenes]);

  useEffect(() => {
    if (!scenes.length || rotationMode === "single" || rotationMode === "stack") return;
    const ms = Math.max(3, rotationIntervalSec) * 1000;
    const id = setInterval(() => {
      setIndex((prev) => {
        if (rotationMode === "random" && scenes.length > 1) {
          let next = prev;
          while (next === prev) next = Math.floor(Math.random() * scenes.length);
          return next;
        }
        return (prev + 1) % scenes.length;
      });
    }, ms);
    return () => clearInterval(id);
  }, [scenes.length, rotationMode, rotationIntervalSec]);

  useEffect(() => {
    if (!scenes.length || rotationMode === "stack") return;
    const s = scenes[index];
    if (s && s.id !== currentSceneId) setCurrentSceneId(s.id);
  }, [index, scenes, currentSceneId, setCurrentSceneId, rotationMode]);

  if (!scenes.length || !masterEnabled || !fxEnabled) return null;

  // Stack mode: every scene renders simultaneously as a z-stacked layer.
  // Order is determined by sortOrder (lower = behind). Each layer carries
  // its own opacity + blendMode, so the user composes a multi-layer scene
  // by creating multiple public scenes.
  if (rotationMode === "stack") {
    const ordered = [...scenes].sort((a, b) => a.sortOrder - b.sortOrder);
    return (
      <>
        {ordered.map((scene, i) => (
          <FxCanvas
            key={scene.id}
            videoUrl={scene.videoUrl}
            videoOpacity={scene.videoOpacity}
            videoBlur={scene.videoBlur}
            mode={scene.fxMode}
            params={scene.fxParams}
            wet={scene.fxWet}
            hover={scene.hover}
            blendMode={scene.blendMode}
            zIndex={i}
            fixed
          />
        ))}
      </>
    );
  }

  const scene = scenes[index];
  if (!scene) return null;

  return (
    <FxCanvas
      videoUrl={scene.videoUrl}
      videoOpacity={scene.videoOpacity}
      videoBlur={scene.videoBlur}
      mode={scene.fxMode}
      params={scene.fxParams}
      wet={scene.fxWet}
      hover={scene.hover}
      blendMode={scene.blendMode}
      fixed
    />
  );
}
