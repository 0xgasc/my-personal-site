/**
 * FX effect catalog — modes + params, ported from tv-landing-v2/src/effects.ts.
 * One single shader implements all modes; selecting a mode chooses which
 * post-processing path runs in the fragment shader.
 */

export type FxMode = "off" | "crt" | "vhs" | "dream" | "ascii" | "pixel" | "dither";

export const FX_MODES: FxMode[] = ["off", "crt", "vhs", "dream", "ascii", "pixel", "dither"];

export interface ParamSpec {
  key: string;
  label: string;
  type: "number" | "select" | "color";
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  default: number | string;
}

export interface ModeSpec {
  label: string;
  effects: { type: string; params: ParamSpec[] }[];
}

export const MODE_SPECS: Record<FxMode, ModeSpec> = {
  off: { label: "OFF", effects: [] },

  crt: {
    label: "CRT",
    effects: [
      {
        type: "crt",
        params: [
          { key: "scanlineIntensity", label: "Scanlines", type: "number", min: 0, max: 1, step: 0.01, default: 0.55 },
          { key: "maskIntensity", label: "Mask", type: "number", min: 0, max: 1, step: 0.01, default: 0.55 },
          { key: "barrelDistortion", label: "Barrel", type: "number", min: 0, max: 0.3, step: 0.01, default: 0.18 },
          { key: "chromaticAberration", label: "CA", type: "number", min: 0, max: 1, step: 0.01, default: 0.35 },
          { key: "brightness", label: "Brightness", type: "number", min: 0.5, max: 1.5, step: 0.01, default: 1.12 },
          { key: "vignetteIntensity", label: "Vignette", type: "number", min: 0, max: 1, step: 0.01, default: 0.55 },
          { key: "flickerIntensity", label: "Flicker", type: "number", min: 0, max: 1, step: 0.01, default: 0.08 },
        ],
      },
    ],
  },

  vhs: {
    label: "VHS",
    effects: [
      {
        type: "chromatic-aberration",
        params: [
          { key: "intensity", label: "CA Intensity", type: "number", min: 0, max: 3, step: 0.05, default: 1.2 },
          { key: "angle", label: "Angle", type: "number", min: 0, max: 180, step: 1, default: 0 },
        ],
      },
      { type: "circuit-bent", params: [] },
    ],
  },

  dream: {
    label: "DREAM",
    effects: [
      {
        type: "bloom",
        params: [
          { key: "bloomIntensity", label: "Bloom", type: "number", min: 0, max: 3, step: 0.05, default: 1.4 },
          { key: "bloomRadius", label: "Radius", type: "number", min: 0, max: 1, step: 0.01, default: 0.75 },
          { key: "bloomSoftness", label: "Softness", type: "number", min: 0, max: 1, step: 0.01, default: 0.85 },
          { key: "bloomThreshold", label: "Threshold", type: "number", min: 0, max: 1, step: 0.01, default: 0.5 },
          { key: "highlightDrive", label: "Highlights", type: "number", min: 0, max: 3, step: 0.05, default: 1.0 },
        ],
      },
    ],
  },

  ascii: {
    label: "ASCII",
    effects: [
      {
        type: "ascii",
        params: [
          { key: "cellSize", label: "Cell Size", type: "number", min: 4, max: 24, step: 1, default: 10 },
          // Glyph style — driven by the shader's procedural pattern generator.
          // default: 5-bucket shape progression
          // dots:    filled dots scaling with luminance
          // blocks:  Unicode-shade-style filled blocks of varying size
          // lines:   thin horizontal lines (scanline character look)
          // binary:  0/1 alternation pattern
          { key: "charset", label: "Charset", type: "select", options: ["default", "dots", "blocks", "lines", "binary"], default: "default" },
          { key: "presenceThreshold", label: "Threshold", type: "number", min: 0, max: 1, step: 0.01, default: 0.0 },
          { key: "shimmerAmount", label: "Shimmer", type: "number", min: 0, max: 1, step: 0.01, default: 0.0 },
          { key: "invert", label: "Invert", type: "number", min: 0, max: 1, step: 1, default: 0 },

          // ─── Recolorer ───────────────────────────────────────────
          { key: "palette", label: "Palette", type: "select", options: ["video", "mono", "duotone", "tritone", "quadtone"], default: "video" },
          { key: "color0", label: "BG / Color 0", type: "color", default: "#0a0a0a" },
          { key: "color1", label: "Color 1", type: "color", default: "#ffffff" },
          { key: "color2", label: "Color 2", type: "color", default: "#ff00aa" },
          { key: "color3", label: "Color 3 (bright)", type: "color", default: "#00ddff" },
        ],
      },
    ],
  },

  pixel: {
    label: "PIXEL",
    effects: [
      {
        type: "pixelation",
        params: [
          { key: "cellSize", label: "Pixel Size", type: "number", min: 2, max: 40, step: 1, default: 8 },
          { key: "aspectRatio", label: "Aspect", type: "number", min: 0.5, max: 2, step: 0.05, default: 1 },
        ],
      },
    ],
  },

  dither: {
    label: "DITHER",
    effects: [
      {
        type: "dithering",
        params: [
          { key: "algorithm", label: "Algorithm", type: "select", options: ["bayer", "ordered", "atkinson"], default: "bayer" },
          { key: "levels", label: "Levels", type: "number", min: 2, max: 8, step: 1, default: 3 },
          { key: "pixelSize", label: "Pixel Size", type: "number", min: 1, max: 12, step: 1, default: 2 },
          { key: "spread", label: "Spread", type: "number", min: 0, max: 1, step: 0.01, default: 0.5 },

          // ─── Recolorer ───────────────────────────────────────────
          { key: "palette", label: "Palette", type: "select", options: ["mono", "duotone", "tritone", "quadtone"], default: "mono" },
          { key: "color0", label: "Color 0 (dark)", type: "color", default: "#0a0a0a" },
          { key: "color1", label: "Color 1", type: "color", default: "#ffffff" },
          { key: "color2", label: "Color 2", type: "color", default: "#ff00aa" },
          { key: "color3", label: "Color 3 (bright)", type: "color", default: "#00ddff" },

          // ─── Character mode ──────────────────────────────────────
          { key: "charMode", label: "Char mode", type: "number", min: 0, max: 1, step: 1, default: 0 },
          { key: "charSize", label: "Char Size", type: "number", min: 6, max: 24, step: 1, default: 10 },
        ],
      },
    ],
  },
};

export type FxParams = Record<string, Record<string, Record<string, number | string>>>;

/** All defaults across all modes — flat object the shader and the editor share. */
export function defaultParams(): FxParams {
  const out: FxParams = {};
  for (const mode of FX_MODES) {
    out[mode] = {};
    for (const eff of MODE_SPECS[mode].effects) {
      out[mode][eff.type] = {};
      for (const p of eff.params) {
        out[mode][eff.type][p.key] = p.default;
      }
    }
  }
  return out;
}

export const MODE_INDEX: Record<FxMode, number> = {
  off: 0,
  crt: 1,
  vhs: 2,
  dream: 3,
  ascii: 4,
  pixel: 5,
  dither: 6,
};
