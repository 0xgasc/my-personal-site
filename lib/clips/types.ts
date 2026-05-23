/**
 * Clip = a background video with its own FX overrides + playback rules.
 * Each clip picks a shader mode (off/crt/vhs/dream/ascii/pixel/dither)
 * with mode-specific params + a universal hover effect on top.
 */

import type { FxMode, FxParams } from "@/lib/fx/effects";
import { defaultParams as defaultFxParams } from "@/lib/fx/effects";

export type Palette = "auto" | "video" | "mono" | "duotone" | "tritone" | "quadtone";
export type BlendMode =
  | "overlay"
  | "soft-light"
  | "hard-light"
  | "multiply"
  | "screen"
  | "difference"
  | "normal";
export type StartMode = "random" | "window" | "fixed";
export type Orientation = "auto" | "landscape" | "portrait";
export type MobileZoom = "cover" | "contain" | "overscan";
export type HoverEffect = "invert" | "pixelate" | "recolor" | "sharpen";

export interface HoverSettings {
  enabled: boolean;
  effect: HoverEffect;
  radius: number;
  intensity: number;
}

export const DEFAULT_HOVER: HoverSettings = {
  enabled: false,
  effect: "invert",
  radius: 0.2,
  intensity: 0.8,
};

export const HOVER_EFFECTS: HoverEffect[] = ["invert", "pixelate", "recolor", "sharpen"];

export interface Clip {
  id: string;
  name: string;
  videoUrl: string;
  isPublic: boolean;
  sortOrder: number;

  // ─── Per-clip FX overrides ─────────────────────────────────
  /** Shader mode applied to the clip via FxCanvas. */
  fxMode: FxMode;
  /** Per-mode shader params. Structure: { mode: { effectType: { key: value } } } */
  fxParams: FxParams;
  /** 0..1 wet/dry mix between raw video and FX-processed output. */
  fxWet: number;
  /** Universal mouse-hover effect applied AFTER any mode FX. */
  hover: HoverSettings;

  // ─── Legacy dither-overlay knobs (kept for the standalone overlay layer) ───
  fxDitherIntensity: number;     // 0..1 — clamp on DitherOverlay alpha
  fxPalette: Palette;            // forces a palette family on the overlay
  fxBlendMode: BlendMode;        // CSS mix-blend-mode for the overlay

  // ─── Start time control ────────────────────────────────────
  startMode: StartMode;          // random | window | fixed
  startWindowMinSec?: number | null;
  startWindowMaxSec?: number | null;
  startFixedSec?: number | null;

  // ─── Cut cadence ───────────────────────────────────────────
  segmentMinSec: number;         // min seconds before jumping
  segmentMaxSec: number;         // max seconds before jumping

  // ─── Layout per device ─────────────────────────────────────
  orientation: Orientation;
  mobileZoom: MobileZoom;
  weight: number;                // higher = chosen more often in rotation

  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_CLIP: Omit<Clip, "id" | "createdAt" | "updatedAt"> = {
  name: "untitled clip",
  videoUrl: "",
  isPublic: false,
  sortOrder: 0,
  fxMode: "off",
  fxParams: defaultFxParams(),
  fxWet: 0.85,
  hover: { ...DEFAULT_HOVER },
  fxDitherIntensity: 0.92,
  fxPalette: "auto",
  fxBlendMode: "overlay",
  startMode: "random",
  startWindowMinSec: null,
  startWindowMaxSec: null,
  startFixedSec: null,
  segmentMinSec: 6,
  segmentMaxSec: 22,
  orientation: "auto",
  mobileZoom: "cover",
  weight: 1,
};

export const PALETTES: Palette[] = ["auto", "video", "mono", "duotone", "tritone", "quadtone"];
export const BLEND_MODES: BlendMode[] = [
  "overlay",
  "soft-light",
  "hard-light",
  "multiply",
  "screen",
  "difference",
  "normal",
];
export const START_MODES: StartMode[] = ["random", "window", "fixed"];
export const ORIENTATIONS: Orientation[] = ["auto", "landscape", "portrait"];
export const MOBILE_ZOOMS: MobileZoom[] = ["cover", "contain", "overscan"];

// ─── DB row <-> Clip mapper ──────────────────────────────────
interface ClipRow {
  id: string;
  name: string;
  video_url: string;
  is_public: boolean;
  sort_order: number;
  fx_mode: string;
  fx_params: FxParams | string | null;
  fx_wet: number | string;
  hover_enabled: boolean;
  hover_effect: string;
  hover_radius: number | string;
  hover_intensity: number | string;
  fx_dither_intensity: number | string;
  fx_palette: string;
  fx_blend_mode: string;
  start_mode: string;
  start_window_min_sec: number | string | null;
  start_window_max_sec: number | string | null;
  start_fixed_sec: number | string | null;
  segment_min_sec: number | string;
  segment_max_sec: number | string;
  orientation: string;
  mobile_zoom: string;
  weight: number;
  created_at: string;
  updated_at: string;
}

const isHoverEffect = (s: string): s is HoverEffect =>
  (HOVER_EFFECTS as string[]).includes(s);

function parseFxParams(v: ClipRow["fx_params"]): FxParams {
  if (!v) return defaultFxParams();
  if (typeof v === "string") {
    try {
      return JSON.parse(v) as FxParams;
    } catch {
      return defaultFxParams();
    }
  }
  return v;
}

const num = (v: number | string | null | undefined): number | undefined =>
  v === null || v === undefined ? undefined : typeof v === "string" ? parseFloat(v) : v;

export function rowToClip(r: ClipRow): Clip {
  return {
    id: r.id,
    name: r.name,
    videoUrl: r.video_url,
    isPublic: r.is_public,
    sortOrder: r.sort_order,
    fxMode: (r.fx_mode || "off") as FxMode,
    fxParams: parseFxParams(r.fx_params),
    fxWet: num(r.fx_wet) ?? DEFAULT_CLIP.fxWet,
    hover: {
      enabled: Boolean(r.hover_enabled ?? DEFAULT_HOVER.enabled),
      effect: isHoverEffect(r.hover_effect ?? "") ? r.hover_effect as HoverEffect : DEFAULT_HOVER.effect,
      radius: num(r.hover_radius) ?? DEFAULT_HOVER.radius,
      intensity: num(r.hover_intensity) ?? DEFAULT_HOVER.intensity,
    },
    fxDitherIntensity: num(r.fx_dither_intensity) ?? DEFAULT_CLIP.fxDitherIntensity,
    fxPalette: (r.fx_palette || "auto") as Palette,
    fxBlendMode: (r.fx_blend_mode || "overlay") as BlendMode,
    startMode: (r.start_mode || "random") as StartMode,
    startWindowMinSec: num(r.start_window_min_sec) ?? null,
    startWindowMaxSec: num(r.start_window_max_sec) ?? null,
    startFixedSec: num(r.start_fixed_sec) ?? null,
    segmentMinSec: num(r.segment_min_sec) ?? DEFAULT_CLIP.segmentMinSec,
    segmentMaxSec: num(r.segment_max_sec) ?? DEFAULT_CLIP.segmentMaxSec,
    orientation: (r.orientation || "auto") as Orientation,
    mobileZoom: (r.mobile_zoom || "cover") as MobileZoom,
    weight: r.weight,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function clipToRow(c: Partial<Clip>): Partial<ClipRow> {
  const out: Partial<ClipRow> = {};
  if (c.name !== undefined) out.name = c.name;
  if (c.videoUrl !== undefined) out.video_url = c.videoUrl;
  if (c.isPublic !== undefined) out.is_public = c.isPublic;
  if (c.sortOrder !== undefined) out.sort_order = c.sortOrder;
  if (c.fxMode !== undefined) out.fx_mode = c.fxMode;
  if (c.fxParams !== undefined) out.fx_params = c.fxParams;
  if (c.fxWet !== undefined) out.fx_wet = c.fxWet;
  if (c.hover !== undefined) {
    out.hover_enabled = c.hover.enabled;
    out.hover_effect = c.hover.effect;
    out.hover_radius = c.hover.radius;
    out.hover_intensity = c.hover.intensity;
  }
  if (c.fxDitherIntensity !== undefined) out.fx_dither_intensity = c.fxDitherIntensity;
  if (c.fxPalette !== undefined) out.fx_palette = c.fxPalette;
  if (c.fxBlendMode !== undefined) out.fx_blend_mode = c.fxBlendMode;
  if (c.startMode !== undefined) out.start_mode = c.startMode;
  if (c.startWindowMinSec !== undefined) out.start_window_min_sec = c.startWindowMinSec;
  if (c.startWindowMaxSec !== undefined) out.start_window_max_sec = c.startWindowMaxSec;
  if (c.startFixedSec !== undefined) out.start_fixed_sec = c.startFixedSec;
  if (c.segmentMinSec !== undefined) out.segment_min_sec = c.segmentMinSec;
  if (c.segmentMaxSec !== undefined) out.segment_max_sec = c.segmentMaxSec;
  if (c.orientation !== undefined) out.orientation = c.orientation;
  if (c.mobileZoom !== undefined) out.mobile_zoom = c.mobileZoom;
  if (c.weight !== undefined) out.weight = c.weight;
  return out;
}
