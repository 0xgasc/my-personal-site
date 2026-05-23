import type { FxMode, FxParams } from "./fx/effects";
import { defaultParams } from "./fx/effects";

export type ThemeOverride = "light" | "dark" | null;
export type HoverEffect = "invert" | "pixelate" | "recolor" | "sharpen";
export type BlendMode =
  | "normal"
  | "screen"
  | "multiply"
  | "overlay"
  | "soft-light"
  | "hard-light"
  | "difference"
  | "exclusion"
  | "color-dodge"
  | "color-burn"
  | "lighten"
  | "darken";

export const BLEND_MODES: BlendMode[] = [
  "normal",
  "screen",
  "multiply",
  "overlay",
  "soft-light",
  "hard-light",
  "difference",
  "exclusion",
  "color-dodge",
  "color-burn",
  "lighten",
  "darken",
];

export interface HoverSettings {
  enabled: boolean;
  effect: HoverEffect;
  radius: number;     // 0.05..0.6 of viewport
  intensity: number;  // 0..1
}

export const DEFAULT_HOVER: HoverSettings = {
  enabled: false,
  effect: "invert",
  radius: 0.2,
  intensity: 0.8,
};

export interface Scene {
  id: string;
  name: string;
  sortOrder: number;
  isPublic: boolean;

  videoUrl: string | null;
  videoOpacity: number;
  videoBlur: number;

  // Single shader-driven FX system, ported from tv-landing-v2.
  // All modes share one fragment shader; mode picks the post-fx path.
  fxMode: FxMode;
  fxParams: FxParams;
  /** Wet/dry mix (0..1). 0 = no FX, 1 = full FX. */
  fxWet: number;

  /** Universal mouse-hover effect applied AFTER any mode FX. */
  hover: HoverSettings;

  /**
   * CSS blend mode used when the canvas stacks on top of other layers
   * in stack mode. Ignored in single/sequential/random rotation modes.
   */
  blendMode: BlendMode;

  themeOverride: ThemeOverride;

  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  id: string;
  masterFxEnabled: boolean;
  defaultTheme: "light" | "dark" | "auto";
  rotationMode: "single" | "sequential" | "random" | "stack";
  rotationIntervalSec: number;
  updatedAt: string;
}

export const DEFAULT_SCENE: Omit<Scene, "id" | "createdAt" | "updatedAt"> = {
  name: "Untitled scene",
  sortOrder: 0,
  isPublic: false,
  videoUrl: null,
  videoOpacity: 1,
  videoBlur: 0,
  fxMode: "off",
  fxParams: defaultParams(),
  fxWet: 0.85,
  hover: { ...DEFAULT_HOVER },
  blendMode: "normal",
  themeOverride: null,
};

export const DEFAULT_SETTINGS: Omit<SiteSettings, "id" | "updatedAt"> = {
  masterFxEnabled: true,
  defaultTheme: "auto",
  rotationMode: "single",
  rotationIntervalSec: 30,
};
