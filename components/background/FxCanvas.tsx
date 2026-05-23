"use client";

import { useEffect, useRef } from "react";
import type { FxMode, FxParams } from "@/lib/fx/effects";
import { MODE_INDEX } from "@/lib/fx/effects";
import type { HoverSettings, BlendMode } from "@/lib/types";
import { DEFAULT_HOVER } from "@/lib/types";

interface Props {
  videoUrl: string | null;
  videoOpacity: number;
  videoBlur: number;
  mode: FxMode;
  params: FxParams;
  /** 0..1 wet/dry mix between raw and FX. */
  wet: number;
  /** Universal mouse-hover effect. */
  hover?: HoverSettings;
  /** Stack-mode compositing — CSS mix-blend-mode applied to the canvas. */
  blendMode?: BlendMode;
  /** Bounded preview vs full-screen background. */
  fixed?: boolean;
  /** Override z-index. Defaults to 0 (background); use higher for stack layers. */
  zIndex?: number;
  /** When the video first loads metadata, seek to this second. Used by
   *  ClipFxPlayer to drive random start times per the clip's startMode. */
  initialSeekSec?: number;
}

/**
 * Single fragment shader that ports tv-landing-v2's FX pipeline, stripped of
 * the bezel/screen-hole logic. Renders one full-frame video, applies the
 * selected post-processing mode, and mixes back to raw via `wet`.
 */
const VS = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = vec2((a_pos.x + 1.0) * 0.5, 1.0 - (a_pos.y + 1.0) * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FS = `
precision highp float;
varying vec2 v_uv;

uniform vec2  u_viewport;
uniform sampler2D u_video;
uniform bool  u_videoReady;
uniform vec2  u_videoPxSize;
uniform vec3  u_bgColor;

uniform float u_time;
uniform int   u_mode;
uniform float u_wet;

uniform float u_scanline, u_mask, u_barrel, u_ca, u_vignette, u_flicker, u_brightness;
uniform float u_vhs_ca;
uniform float u_bloom, u_bloomThr;
uniform float u_cell, u_ditherLevels;
uniform float u_ditherSpread;
uniform int   u_ditherAlgo;        // 0=bayer 1=ordered 2=atkinson
uniform int   u_dithCharMode;      // 0=off 1=on (dither-only)
uniform float u_dithCharSize;
uniform int   u_asciiInvert;       // 0/1 (ascii only)

// Shared by ASCII + DITHER modes — populated from the active mode's params.
uniform int   u_palette;           // ascii: 0=video 1=mono 2=duo 3=tri 4=quad ; dither: 0=mono 1=duo 2=tri 3=quad
uniform vec3  u_pal0, u_pal1, u_pal2, u_pal3;
uniform int   u_hoverEnabled;
uniform int   u_hoverEffect;       // 0=invert 1=pixelate 2=recolor 3=sharpen
uniform float u_hoverRadius;
uniform float u_hoverIntensity;
uniform vec2  u_mouse;             // 0..1 normalized; (-1,-1) = inactive

// Forward declarations — GLSL is single-pass, so callers like applyAscii
// need to know these signatures before they're called.
vec3 paletteSample(int palMode, float lum);
float hoverFactor(vec2 uv);
float ditherGlyph(float lum, vec2 t);
float bayer(vec2 p);

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

vec3 sampleVideo(vec2 uv) {
  if (!u_videoReady) return u_bgColor;
  // Cover-fit the video into the viewport without distortion.
  float vAspect = u_videoPxSize.x / max(u_videoPxSize.y, 1.0);
  float sAspect = u_viewport.x / max(u_viewport.y, 1.0);
  vec2 vUV = uv;
  if (vAspect > sAspect) {
    float f = sAspect / vAspect;
    vUV.x = 0.5 + (vUV.x - 0.5) * f;
  } else {
    float f = vAspect / sAspect;
    vUV.y = 0.5 + (vUV.y - 0.5) * f;
  }
  return texture2D(u_video, vUV).rgb;
}

vec2 barrel(vec2 uv, float amt) {
  vec2 c = uv - 0.5;
  float r2 = dot(c, c);
  return 0.5 + c * (1.0 + amt * r2);
}

vec3 applyCRT(vec2 uv) {
  vec2 buv = barrel(uv, u_barrel);
  float sep = u_ca * 0.006;
  float r = sampleVideo(buv + vec2( sep, 0.0)).r;
  float g = sampleVideo(buv).g;
  float b = sampleVideo(buv + vec2(-sep, 0.0)).b;
  vec3 col = vec3(r, g, b);
  float scan = 0.5 + 0.5 * sin(buv.y * u_viewport.y * 2.4);
  col *= mix(1.0, scan, u_scanline);
  float stripe = mod(floor(buv.x * u_viewport.x), 3.0);
  vec3 maskCol = stripe < 1.0 ? vec3(1.12, 0.92, 0.92)
              : stripe < 2.0 ? vec3(0.92, 1.12, 0.92)
                             : vec3(0.92, 0.92, 1.12);
  col *= mix(vec3(1.0), maskCol, u_mask);
  float vig = smoothstep(1.0, 0.3, length(buv - 0.5));
  col *= mix(1.0, vig, u_vignette);
  col *= 1.0 + (sin(u_time * 7.0) * u_flicker * 0.06 - u_flicker * 0.03);
  col *= u_brightness;
  return col;
}

vec3 applyVHS(vec2 uv) {
  float rowNoise = hash(vec2(floor(uv.y * 240.0), floor(u_time * 4.0)));
  float jitter = (rowNoise - 0.5) * 0.015;
  vec2 juv = uv + vec2(jitter, 0.0);
  float sep = u_vhs_ca * 0.008 + 0.002 * sin(u_time * 0.8 + uv.y * 40.0);
  float r = sampleVideo(juv + vec2( sep, 0.0)).r;
  float g = sampleVideo(juv).g;
  float b = sampleVideo(juv + vec2(-sep, 0.0)).b;
  vec3 col = vec3(r, g, b);
  float n = hash(uv * u_viewport + u_time * 60.0) * 0.12;
  col += n - 0.06;
  float band = smoothstep(0.0, 0.05, abs(fract(uv.y - u_time * 0.1) - 0.5));
  col *= mix(0.7, 1.0, band);
  return col;
}

vec3 applyDream(vec2 uv) {
  vec3 acc = vec3(0.0);
  for (int i = 0; i < 8; i++) {
    float f = float(i) / 8.0;
    vec2 dir = (uv - 0.5) * (0.01 + 0.025 * f);
    acc += sampleVideo(uv - dir);
  }
  vec3 col = acc / 8.0;
  vec3 hi = max(col - u_bloomThr, 0.0);
  col += hi * u_bloom;
  float a = 0.4 + 0.2 * sin(u_time * 0.3);
  mat3 hue = mat3(
    0.299 + 0.701 * cos(a) + 0.168 * sin(a),
    0.587 - 0.587 * cos(a) + 0.330 * sin(a),
    0.114 - 0.114 * cos(a) - 0.497 * sin(a),
    0.299 - 0.299 * cos(a) - 0.328 * sin(a),
    0.587 + 0.413 * cos(a) + 0.035 * sin(a),
    0.114 - 0.114 * cos(a) + 0.292 * sin(a),
    0.299 - 0.300 * cos(a) + 1.250 * sin(a),
    0.587 - 0.588 * cos(a) - 1.050 * sin(a),
    0.114 + 0.886 * cos(a) - 0.203 * sin(a)
  );
  col = clamp(hue * col, 0.0, 1.0);
  return col;
}

vec3 applyAscii(vec2 uv) {
  float effCell = max(2.0, u_cell);
  vec2 cellSize = vec2(effCell) / u_viewport;
  vec2 cellUv = floor(uv / cellSize) * cellSize + cellSize * 0.5;
  vec3 sampled = sampleVideo(cellUv);
  float lum = dot(sampled, vec3(0.299, 0.587, 0.114));
  if (u_asciiInvert == 1) lum = 1.0 - lum;

  vec2 t = mod(uv, cellSize) / cellSize;
  float glyph = ditherGlyph(lum, t);

  // u_palette for ASCII: 0=video (sample) 1=mono 2=duo 3=tri 4=quad
  vec3 fg = u_palette == 0 ? sampled : paletteSample(u_palette - 1, lum);
  vec3 bg = (u_palette == 0 || u_palette == 1) ? vec3(0.0) : u_pal0;
  return mix(bg, fg, glyph);
}

vec3 applyPixel(vec2 uv) {
  vec2 cellSize = vec2(u_cell) / u_viewport;
  vec2 cellUv = floor(uv / cellSize) * cellSize + cellSize * 0.5;
  return sampleVideo(cellUv);
}

float bayer(vec2 p) {
  int x = int(mod(p.x, 4.0));
  int y = int(mod(p.y, 4.0));
  int idx = x + y * 4;
  float arr[16];
  arr[0]=0.0;  arr[1]=8.0;  arr[2]=2.0;  arr[3]=10.0;
  arr[4]=12.0; arr[5]=4.0;  arr[6]=14.0; arr[7]=6.0;
  arr[8]=3.0;  arr[9]=11.0; arr[10]=1.0; arr[11]=9.0;
  arr[12]=15.0;arr[13]=7.0; arr[14]=13.0;arr[15]=5.0;
  float v = 0.0;
  for (int i = 0; i < 16; i++) { if (i == idx) v = arr[i]; }
  return v / 16.0;
}

// palMode: 0=mono(grayscale) 1=duo 2=tri 3=quad
vec3 paletteSample(int palMode, float lum) {
  if (palMode == 0) return vec3(lum);
  if (palMode == 1) return mix(u_pal0, u_pal1, lum);
  if (palMode == 2) {
    if (lum < 0.5) return mix(u_pal0, u_pal1, lum * 2.0);
    return mix(u_pal1, u_pal2, (lum - 0.5) * 2.0);
  }
  if (lum < 0.3333) return mix(u_pal0, u_pal1, lum / 0.3333);
  if (lum < 0.6666) return mix(u_pal1, u_pal2, (lum - 0.3333) / 0.3333);
  return mix(u_pal2, u_pal3, (lum - 0.6666) / 0.3334);
}

float hoverFactor(vec2 uv) {
  if (u_hoverEnabled == 0 || u_mouse.x < 0.0) return 0.0;
  vec2 d = uv - u_mouse;
  d.x *= u_viewport.x / max(u_viewport.y, 1.0);
  float dist = length(d);
  if (dist >= u_hoverRadius) return 0.0;
  return smoothstep(u_hoverRadius, 0.0, dist) * u_hoverIntensity;
}

float ditherGlyph(float lum, vec2 t) {
  // Procedural ASCII-style glyph driven by luminance bucket.
  if (lum < 0.18) return 0.0;
  if (lum < 0.32) return (abs(t.x - 0.5) < 0.06 && abs(t.y - 0.5) < 0.4) ? 1.0 : 0.0;
  if (lum < 0.5)  return (abs(t.x - t.y) < 0.10 || abs(t.x - (1.0 - t.y)) < 0.10) ? 1.0 : 0.0;
  if (lum < 0.7)  {
    float d = length(t - 0.5);
    return (d < 0.34 && d > 0.18) ? 1.0 : 0.0;
  }
  return (t.x > 0.12 && t.x < 0.88 && t.y > 0.12 && t.y < 0.88) ? 1.0 : 0.0;
}

vec3 applyDither(vec2 uv) {
  float cellSize = max(1.0, u_cell);
  float charCell = max(4.0, u_dithCharSize);

  vec2 sampleUv;
  if (u_dithCharMode == 1) {
    vec2 cs = vec2(charCell) / u_viewport;
    sampleUv = floor(uv / cs) * cs + cs * 0.5;
  } else {
    vec2 cs = vec2(cellSize) / u_viewport;
    sampleUv = floor(uv / cs) * cs + cs * 0.5;
  }
  vec3 col = sampleVideo(sampleUv);

  float thr;
  if (u_ditherAlgo == 0) thr = bayer(gl_FragCoord.xy);
  else if (u_ditherAlgo == 1) thr = mod(floor(gl_FragCoord.x) + floor(gl_FragCoord.y), 2.0) * 0.5;
  else thr = bayer(gl_FragCoord.xy * 0.5);
  thr = mix(0.5, thr, u_ditherSpread);

  float levels = max(2.0, u_ditherLevels);
  vec3 quant = floor(col * (levels - 1.0) + thr) / (levels - 1.0);
  float lum = dot(quant, vec3(0.299, 0.587, 0.114));

  vec3 outCol = paletteSample(u_palette, lum);

  // Character mode wraps the palette output in a glyph mask.
  if (u_dithCharMode == 1) {
    vec2 cs = vec2(charCell) / u_viewport;
    vec2 t = mod(uv, cs) / cs;
    float g = ditherGlyph(lum, t);
    vec3 bg = u_palette == 0 ? vec3(0.04) : u_pal0;
    outCol = mix(bg, outCol, g);
  }

  return outCol;
}

// Universal hover post-pass: invert / recolor / sharpen.
// Applied after the mode runs, regardless of which mode is active.
vec3 applyHoverPost(vec3 col, float h) {
  if (h <= 0.0) return col;
  if (u_hoverEffect == 0) {
    return mix(col, vec3(1.0) - col, h);
  }
  if (u_hoverEffect == 2) {
    // recolor: simple channel rotation R->G->B->R
    return mix(col, vec3(col.b, col.r, col.g), h);
  }
  if (u_hoverEffect == 3) {
    // sharpen: push toward 0/1 around mid-grey
    vec3 mid = vec3(0.5);
    vec3 sharper = mix(col, step(mid, col), h);
    return mix(col, sharper, h);
  }
  return col;
}

void main() {
  vec2 uv = v_uv;

  // Hover pre-pass: pixelate snaps the UV onto a coarser grid before the
  // mode FX runs, giving universal "chunkify near cursor" behavior.
  float h = hoverFactor(uv);
  vec2 fxUv = uv;
  if (h > 0.0 && u_hoverEffect == 1) {
    float pxSize = mix(1.0, 18.0, h);
    vec2 cs = vec2(pxSize) / u_viewport;
    fxUv = floor(uv / cs) * cs + cs * 0.5;
  }

  vec3 raw = sampleVideo(fxUv);
  vec3 fx = raw;
  if (u_mode == 1)      fx = applyCRT(fxUv);
  else if (u_mode == 2) fx = applyVHS(fxUv);
  else if (u_mode == 3) fx = applyDream(fxUv);
  else if (u_mode == 4) fx = applyAscii(fxUv);
  else if (u_mode == 5) fx = applyPixel(fxUv);
  else if (u_mode == 6) fx = applyDither(fxUv);

  vec3 col = mix(raw, fx, u_wet);
  // Hover post-pass: invert / recolor / sharpen on the final color.
  col = applyHoverPost(col, h);
  gl_FragColor = vec4(col, 1.0);
}
`;

function num(p: FxParams, mode: string, eff: string, k: string, def: number): number {
  const v = p?.[mode]?.[eff]?.[k];
  return typeof v === "number" ? v : def;
}

function str(p: FxParams, mode: string, eff: string, k: string, def: string): string {
  const v = p?.[mode]?.[eff]?.[k];
  return typeof v === "string" ? v : def;
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-fA-F0-9]{6})$/.exec(hex.trim());
  if (!m) return [1, 1, 1];
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 0xff) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255];
}

const DITHER_PALETTE_INDEX: Record<string, number> = {
  mono: 0,
  duotone: 1,
  tritone: 2,
  quadtone: 3,
};
const ASCII_PALETTE_INDEX: Record<string, number> = {
  video: 0,
  mono: 1,
  duotone: 2,
  tritone: 3,
  quadtone: 4,
};
const ALGO_INDEX: Record<string, number> = { bayer: 0, ordered: 1, atkinson: 2 };
const HOVER_EFFECT_INDEX: Record<string, number> = {
  invert: 0,
  pixelate: 1,
  recolor: 2,
  sharpen: 3,
};

export default function FxCanvas({
  videoUrl,
  videoOpacity,
  videoBlur,
  mode,
  params,
  wet,
  hover,
  blendMode,
  fixed = true,
  zIndex,
  initialSeekSec,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const effectiveHover = hover ?? DEFAULT_HOVER;
  const propsRef = useRef({
    videoUrl,
    mode,
    params,
    wet,
    videoOpacity,
    videoBlur,
    hover: effectiveHover,
    initialSeekSec,
  });
  propsRef.current = {
    videoUrl,
    mode,
    params,
    wet,
    videoOpacity,
    videoBlur,
    hover: effectiveHover,
    initialSeekSec,
  };
  // Mouse in normalized 0..1 coords relative to the canvas. (-1,-1) = inactive.
  const mouseRef = useRef({ x: -1, y: -1 });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: false, antialias: false });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error("FxCanvas shader compile:", gl.getShaderInfoLog(sh));
      }
      return sh;
    };
    const vs = compile(gl.VERTEX_SHADER, VS);
    const fs = compile(gl.FRAGMENT_SHADER, FS);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("FxCanvas link:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const posLoc = gl.getAttribLocation(prog, "a_pos");
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uniformNames = [
      "u_viewport",
      "u_video",
      "u_videoReady",
      "u_videoPxSize",
      "u_bgColor",
      "u_time",
      "u_mode",
      "u_wet",
      "u_scanline",
      "u_mask",
      "u_barrel",
      "u_ca",
      "u_vignette",
      "u_flicker",
      "u_brightness",
      "u_vhs_ca",
      "u_bloom",
      "u_bloomThr",
      "u_cell",
      "u_ditherLevels",
      "u_ditherSpread",
      "u_ditherAlgo",
      "u_dithCharMode",
      "u_dithCharSize",
      "u_asciiInvert",
      "u_palette",
      "u_pal0",
      "u_pal1",
      "u_pal2",
      "u_pal3",
      "u_hoverEnabled",
      "u_hoverEffect",
      "u_hoverRadius",
      "u_hoverIntensity",
      "u_mouse",
    ] as const;
    const u: Record<string, WebGLUniformLocation | null> = {};
    for (const n of uniformNames) u[n] = gl.getUniformLocation(prog, n);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);

    const setupTex = (t: WebGLTexture) => {
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([10, 10, 10, 255]));
    };

    interface VideoEntry {
      tex: WebGLTexture;
      el: HTMLVideoElement;
      pxSize: { w: number; h: number };
      ready: boolean;
      onMeta: () => void;
    }
    let current: { src: string; entry: VideoEntry } | null = null;

    const ensureVideo = (src: string | null) => {
      if (!src) {
        if (current) {
          current.entry.el.pause();
          current.entry.el.removeEventListener("loadedmetadata", current.entry.onMeta);
          current = null;
        }
        return;
      }
      if (current && current.src === src) return;
      if (current) {
        current.entry.el.pause();
        current.entry.el.removeEventListener("loadedmetadata", current.entry.onMeta);
      }
      // Route remote (cross-origin) sources through a same-origin proxy so
      // WebGL doesn't taint the canvas. Local /public assets pass through.
      let resolved = src;
      try {
        const parsed = new URL(src, window.location.href);
        if (parsed.origin !== window.location.origin) {
          resolved = `/api/video?url=${encodeURIComponent(src)}`;
        }
      } catch {
        // not a parseable URL — leave as-is
      }
      const tex = gl.createTexture()!;
      setupTex(tex);
      const el = document.createElement("video");
      el.muted = true;
      el.playsInline = true;
      el.loop = true;
      el.preload = "auto";
      const entry: VideoEntry = {
        tex,
        el,
        pxSize: { w: 1, h: 1 },
        ready: false,
        onMeta() {
          entry.pxSize = { w: el.videoWidth || 1, h: el.videoHeight || 1 };
          // Apply caller's initial seek if provided.
          const seek = propsRef.current.initialSeekSec;
          if (typeof seek === "number" && el.duration > 0) {
            const target = Math.max(0, Math.min(el.duration - 0.1, seek));
            try {
              el.currentTime = target;
            } catch {
              // ignore — some browsers reject seeks pre-canplay
            }
          }
        },
      };
      el.addEventListener("loadedmetadata", entry.onMeta);
      el.src = resolved;
      el.load();
      el.play().catch(() => {});
      current = { src, entry };
    };

    ensureVideo(propsRef.current.videoUrl);

    let rafId = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const cssW = Math.max(1, Math.floor(rect.width));
      const cssH = Math.max(1, Math.floor(rect.height));
      const newW = Math.max(1, Math.floor(cssW * dpr));
      const newH = Math.max(1, Math.floor(cssH * dpr));
      if (canvas.width !== newW || canvas.height !== newH) {
        canvas.width = newW;
        canvas.height = newH;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener("resize", resize);
    resize();

    // Track mouse in normalized canvas-space (0..1). Listen on window so the
    // hover effect picks up the cursor even though the canvas itself has
    // pointer-events: none.
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / Math.max(rect.width, 1);
      const y = (e.clientY - rect.top) / Math.max(rect.height, 1);
      if (x < 0 || x > 1 || y < 0 || y > 1) {
        mouseRef.current.x = -1;
        mouseRef.current.y = -1;
      } else {
        mouseRef.current.x = x;
        mouseRef.current.y = y;
      }
    };
    const onPointerLeave = () => {
      mouseRef.current.x = -1;
      mouseRef.current.y = -1;
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("mouseleave", onPointerLeave);

    const startT = performance.now();

    const render = () => {
      const p = propsRef.current;
      ensureVideo(p.videoUrl);
      resize();

      const v = current?.entry;
      if (v && v.el.readyState >= 2) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, v.tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, v.el);
        v.ready = true;
      }

      gl.uniform2f(u.u_viewport, canvas.width, canvas.height);
      gl.uniform1i(u.u_video, 0);
      gl.uniform1i(u.u_videoReady, v?.ready ? 1 : 0);
      gl.uniform2f(u.u_videoPxSize, v?.pxSize.w ?? 1, v?.pxSize.h ?? 1);
      gl.uniform3f(u.u_bgColor, 0.039, 0.039, 0.039);
      gl.uniform1f(u.u_time, (performance.now() - startT) / 1000);
      gl.uniform1i(u.u_mode, MODE_INDEX[p.mode]);
      gl.uniform1f(u.u_wet, p.wet);

      const pp = p.params;
      gl.uniform1f(u.u_scanline, num(pp, "crt", "crt", "scanlineIntensity", 0.55));
      gl.uniform1f(u.u_mask, num(pp, "crt", "crt", "maskIntensity", 0.55));
      gl.uniform1f(u.u_barrel, num(pp, "crt", "crt", "barrelDistortion", 0.18));
      gl.uniform1f(u.u_ca, num(pp, "crt", "crt", "chromaticAberration", 0.35));
      gl.uniform1f(u.u_vignette, num(pp, "crt", "crt", "vignetteIntensity", 0.55));
      gl.uniform1f(u.u_flicker, num(pp, "crt", "crt", "flickerIntensity", 0.08));
      gl.uniform1f(u.u_brightness, num(pp, "crt", "crt", "brightness", 1.12));
      gl.uniform1f(u.u_vhs_ca, num(pp, "vhs", "chromatic-aberration", "intensity", 1.2));
      gl.uniform1f(u.u_bloom, num(pp, "dream", "bloom", "bloomIntensity", 1.4));
      gl.uniform1f(u.u_bloomThr, num(pp, "dream", "bloom", "bloomThreshold", 0.5));
      const cell =
        p.mode === "ascii"
          ? num(pp, "ascii", "ascii", "cellSize", 10)
          : p.mode === "pixel"
            ? num(pp, "pixel", "pixelation", "cellSize", 8)
            : p.mode === "dither"
              ? num(pp, "dither", "dithering", "pixelSize", 2)
              : 8;
      gl.uniform1f(u.u_cell, cell * dpr);

      // Dither-specific
      gl.uniform1f(u.u_ditherLevels, num(pp, "dither", "dithering", "levels", 3));
      gl.uniform1f(u.u_ditherSpread, num(pp, "dither", "dithering", "spread", 0.5));
      gl.uniform1i(
        u.u_ditherAlgo,
        ALGO_INDEX[str(pp, "dither", "dithering", "algorithm", "bayer")] ?? 0
      );
      gl.uniform1i(u.u_dithCharMode, num(pp, "dither", "dithering", "charMode", 0) > 0.5 ? 1 : 0);
      gl.uniform1f(
        u.u_dithCharSize,
        num(pp, "dither", "dithering", "charSize", 10) * dpr
      );

      // ASCII-specific
      gl.uniform1i(u.u_asciiInvert, num(pp, "ascii", "ascii", "invert", 0) > 0.5 ? 1 : 0);

      // Palette is mode-specific (ASCII vs DITHER each have their own colors).
      let paletteIdx = 0;
      let c0Hex = "#0a0a0a", c1Hex = "#ffffff", c2Hex = "#ff00aa", c3Hex = "#00ddff";
      if (p.mode === "ascii") {
        paletteIdx =
          ASCII_PALETTE_INDEX[str(pp, "ascii", "ascii", "palette", "video")] ?? 0;
        c0Hex = str(pp, "ascii", "ascii", "color0", c0Hex);
        c1Hex = str(pp, "ascii", "ascii", "color1", c1Hex);
        c2Hex = str(pp, "ascii", "ascii", "color2", c2Hex);
        c3Hex = str(pp, "ascii", "ascii", "color3", c3Hex);
      } else if (p.mode === "dither") {
        paletteIdx =
          DITHER_PALETTE_INDEX[str(pp, "dither", "dithering", "palette", "mono")] ?? 0;
        c0Hex = str(pp, "dither", "dithering", "color0", c0Hex);
        c1Hex = str(pp, "dither", "dithering", "color1", c1Hex);
        c2Hex = str(pp, "dither", "dithering", "color2", c2Hex);
        c3Hex = str(pp, "dither", "dithering", "color3", c3Hex);
      }
      gl.uniform1i(u.u_palette, paletteIdx);
      const c0 = hexToRgb(c0Hex);
      const c1 = hexToRgb(c1Hex);
      const c2 = hexToRgb(c2Hex);
      const c3 = hexToRgb(c3Hex);
      gl.uniform3f(u.u_pal0, c0[0], c0[1], c0[2]);
      gl.uniform3f(u.u_pal1, c1[0], c1[1], c1[2]);
      gl.uniform3f(u.u_pal2, c2[0], c2[1], c2[2]);
      gl.uniform3f(u.u_pal3, c3[0], c3[1], c3[2]);

      // Hover is now scene-level — applies to ALL modes uniformly.
      gl.uniform1i(u.u_hoverEnabled, p.hover.enabled ? 1 : 0);
      gl.uniform1i(u.u_hoverEffect, HOVER_EFFECT_INDEX[p.hover.effect] ?? 0);
      gl.uniform1f(u.u_hoverRadius, p.hover.radius);
      gl.uniform1f(u.u_hoverIntensity, p.hover.intensity);
      gl.uniform2f(u.u_mouse, mouseRef.current.x, mouseRef.current.y);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("mouseleave", onPointerLeave);
      if (current) {
        current.entry.el.pause();
        current.entry.el.removeEventListener("loadedmetadata", current.entry.onMeta);
        current.entry.el.removeAttribute("src");
        current.entry.el.load();
        current = null;
      }
    };
  }, []);

  const effectiveZ = zIndex ?? 0;
  const style: React.CSSProperties = fixed
    ? {
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: effectiveZ,
        pointerEvents: "none",
      }
    : { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" };

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        ...style,
        opacity: videoOpacity,
        filter: videoBlur > 0 ? `blur(${videoBlur}px)` : undefined,
        mixBlendMode: blendMode && blendMode !== "normal" ? blendMode : undefined,
      }}
    />
  );
}
