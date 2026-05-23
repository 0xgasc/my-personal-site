"use client";

import FxCanvas from "./FxCanvas";
import type { Scene } from "@/lib/types";

interface ScenePreviewProps {
  scene: Scene;
  className?: string;
}

/**
 * Bounded preview pane for the admin scene editor — same shader as the
 * full-screen background, but constrained to its parent box.
 */
export default function ScenePreview({ scene, className }: ScenePreviewProps) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        background: scene.themeOverride === "light" ? "#ffffff" : "#0a0a0a",
        borderRadius: 12,
        isolation: "isolate",
      }}
    >
      <FxCanvas
        videoUrl={scene.videoUrl}
        videoOpacity={scene.videoOpacity}
        videoBlur={scene.videoBlur}
        mode={scene.fxMode}
        params={scene.fxParams}
        wet={scene.fxWet}
        hover={scene.hover}
        fixed={false}
      />
    </div>
  );
}
