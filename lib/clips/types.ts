/**
 * Clip = a background video with its own FX overrides + playback rules.
 * Replaces the older scene/site_settings model entirely.
 */

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

export interface Clip {
  id: string;
  name: string;
  videoUrl: string;
  isPublic: boolean;
  sortOrder: number;

  // ─── Per-clip FX overrides ─────────────────────────────────
  fxDitherIntensity: number;     // 0..1 — clamp on DitherOverlay alpha
  fxPalette: Palette;            // forces a palette family on this clip
  fxBlendMode: BlendMode;        // CSS mix-blend-mode for the dither layer

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

const num = (v: number | string | null | undefined): number | undefined =>
  v === null || v === undefined ? undefined : typeof v === "string" ? parseFloat(v) : v;

export function rowToClip(r: ClipRow): Clip {
  return {
    id: r.id,
    name: r.name,
    videoUrl: r.video_url,
    isPublic: r.is_public,
    sortOrder: r.sort_order,
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
