import type { Scene, SiteSettings, ThemeOverride, HoverEffect, BlendMode } from "@/lib/types";
import { BLEND_MODES } from "@/lib/types";
import type { FxMode, FxParams } from "@/lib/fx/effects";
import { defaultParams } from "@/lib/fx/effects";
import { DEFAULT_HOVER } from "@/lib/types";

interface SceneRow {
  id: string;
  name: string;
  sort_order: number;
  is_public: boolean;
  video_url: string | null;
  video_opacity: number | string;
  video_blur: number | string;
  fx_mode: string;
  fx_params: FxParams | string | null;
  fx_wet: number | string;
  hover_enabled: boolean;
  hover_effect: string;
  hover_radius: number | string;
  hover_intensity: number | string;
  blend_mode: string;
  theme_override: string | null;
  created_at: string;
  updated_at: string;
}

const VALID_HOVER_EFFECTS: HoverEffect[] = ["invert", "pixelate", "recolor", "sharpen"];
const isHoverEffect = (s: string): s is HoverEffect =>
  (VALID_HOVER_EFFECTS as string[]).includes(s);
const isBlendMode = (s: string): s is BlendMode => (BLEND_MODES as string[]).includes(s);

interface SettingsRow {
  id: string;
  master_fx_enabled: boolean;
  default_theme: string;
  rotation_mode: string;
  rotation_interval_sec: number;
  updated_at: string;
}

const num = (v: number | string) => (typeof v === "string" ? parseFloat(v) : v);

function parseParams(v: SceneRow["fx_params"]): FxParams {
  if (!v) return defaultParams();
  if (typeof v === "string") {
    try {
      return JSON.parse(v) as FxParams;
    } catch {
      return defaultParams();
    }
  }
  return v;
}

export function rowToScene(r: SceneRow): Scene {
  return {
    id: r.id,
    name: r.name,
    sortOrder: r.sort_order,
    isPublic: r.is_public,
    videoUrl: r.video_url,
    videoOpacity: num(r.video_opacity),
    videoBlur: num(r.video_blur),
    fxMode: (r.fx_mode || "off") as FxMode,
    fxParams: parseParams(r.fx_params),
    fxWet: num(r.fx_wet),
    hover: {
      enabled: Boolean(r.hover_enabled ?? DEFAULT_HOVER.enabled),
      effect: isHoverEffect(r.hover_effect) ? r.hover_effect : DEFAULT_HOVER.effect,
      radius: num(r.hover_radius ?? DEFAULT_HOVER.radius),
      intensity: num(r.hover_intensity ?? DEFAULT_HOVER.intensity),
    },
    blendMode: r.blend_mode && isBlendMode(r.blend_mode) ? r.blend_mode : "normal",
    themeOverride: (r.theme_override ?? null) as ThemeOverride,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function sceneToRow(s: Partial<Scene>): Partial<SceneRow> {
  const out: Partial<SceneRow> = {};
  if (s.name !== undefined) out.name = s.name;
  if (s.sortOrder !== undefined) out.sort_order = s.sortOrder;
  if (s.isPublic !== undefined) out.is_public = s.isPublic;
  if (s.videoUrl !== undefined) out.video_url = s.videoUrl;
  if (s.videoOpacity !== undefined) out.video_opacity = s.videoOpacity;
  if (s.videoBlur !== undefined) out.video_blur = s.videoBlur;
  if (s.fxMode !== undefined) out.fx_mode = s.fxMode;
  if (s.fxParams !== undefined) out.fx_params = s.fxParams;
  if (s.fxWet !== undefined) out.fx_wet = s.fxWet;
  if (s.hover !== undefined) {
    out.hover_enabled = s.hover.enabled;
    out.hover_effect = s.hover.effect;
    out.hover_radius = s.hover.radius;
    out.hover_intensity = s.hover.intensity;
  }
  if (s.blendMode !== undefined) out.blend_mode = s.blendMode;
  if (s.themeOverride !== undefined) out.theme_override = s.themeOverride;
  return out;
}

export function rowToSettings(r: SettingsRow): SiteSettings {
  return {
    id: r.id,
    masterFxEnabled: r.master_fx_enabled,
    defaultTheme: r.default_theme as SiteSettings["defaultTheme"],
    rotationMode: r.rotation_mode as SiteSettings["rotationMode"],
    rotationIntervalSec: r.rotation_interval_sec,
    updatedAt: r.updated_at,
  };
}

export function settingsToRow(s: Partial<SiteSettings>): Partial<SettingsRow> {
  const out: Partial<SettingsRow> = {};
  if (s.masterFxEnabled !== undefined) out.master_fx_enabled = s.masterFxEnabled;
  if (s.defaultTheme !== undefined) out.default_theme = s.defaultTheme;
  if (s.rotationMode !== undefined) out.rotation_mode = s.rotationMode;
  if (s.rotationIntervalSec !== undefined) out.rotation_interval_sec = s.rotationIntervalSec;
  return out;
}
