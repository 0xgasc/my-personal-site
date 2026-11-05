"use client";

import { useEffect, useRef } from "react";
import { useApp } from "@/contexts/AppContext";

/**
 * Shaded "glass" backdrop: soft colour blooms seen through fluted or
 * frosted glass, with film grain, chromatic aberration and a vignette.
 * A preset is picked at random on each visit (never the same one twice in
 * a row) and its blooms get a fresh random layout, so no two loads match.
 */

type Preset = {
  name: string;
  base: [string, string]; // background gradient, top → bottom
  blooms: string[]; // up to 4 bloom colours
  flutes: number; // ribs across the screen; 0 = frosted only
  refract: number; // how far each rib bends what's behind it
  aberration: number; // RGB split strength
  grain: number;
  beam: number; // 0..1, squeezes blooms into a vertical beam
  spread: number; // bloom size
};

const PRESETS: Preset[] = [
  { name: "magenta-rib", base: ["#12040f", "#1c0619"], blooms: ["#ff2bd6", "#b100ff", "#ff5ad9"], flutes: 46, refract: 0.035, aberration: 0.6, grain: 0.07, beam: 0.8, spread: 0.32 },
  { name: "cold-warm", base: ["#2d4c86", "#cfd8ea"], blooms: ["#ff5a2a", "#3b6fd8", "#f4c6c0"], flutes: 0, refract: 0, aberration: 0.25, grain: 0.11, beam: 0, spread: 0.42 },
  { name: "moss-haze", base: ["#2a3a22", "#516a3c"], blooms: ["#7f9b5a", "#1d2a17", "#a9b98a"], flutes: 0, refract: 0, aberration: 0.15, grain: 0.16, beam: 0, spread: 0.36 },
  { name: "violet-frost", base: ["#e9ecff", "#9fb0ff"], blooms: ["#1e2bff", "#4a12c9", "#ff4a1c", "#0b1a9e"], flutes: 0, refract: 0, aberration: 1.0, grain: 0.08, beam: 0, spread: 0.3 },
  { name: "ember-rib", base: ["#2a0905", "#3a0c06"], blooms: ["#ff4a1f", "#ff8a3d", "#1a0b3a"], flutes: 11, refract: 0.06, aberration: 0.5, grain: 0.07, beam: 0.15, spread: 0.36 },
  { name: "indigo-blend", base: ["#1f1a6e", "#3b2fd0"], blooms: ["#6a5cff", "#2a1f9a", "#9a8cff"], flutes: 0, refract: 0, aberration: 0.1, grain: 0.06, beam: 0, spread: 0.5 },
  { name: "ultraviolet-rib", base: ["#050310", "#0a0620"], blooms: ["#5a1fff", "#2b00c9", "#8a4bff"], flutes: 34, refract: 0.045, aberration: 0.7, grain: 0.08, beam: 0.55, spread: 0.3 },
  { name: "prism-white", base: ["#f4f2ec", "#e6e9f2"], blooms: ["#0d1f8a", "#2a56d6", "#0a0f3a"], flutes: 18, refract: 0.05, aberration: 0.9, grain: 0.05, beam: 0.65, spread: 0.24 },
  { name: "garden-blur", base: ["#1f2a18", "#33452a"], blooms: ["#f2b8c8", "#f7f2ea", "#5c7a43", "#e891aa"], flutes: 0, refract: 0, aberration: 0.3, grain: 0.13, beam: 0, spread: 0.22 },
  { name: "dusk-teal", base: ["#06232a", "#0d3a40"], blooms: ["#ffb35c", "#1fa3a3", "#ff6f61"], flutes: 24, refract: 0.03, aberration: 0.45, grain: 0.09, beam: 0.25, spread: 0.34 },
];

const VS = `attribute vec2 a_pos;varying vec2 v_uv;void main(){v_uv=(a_pos+1.0)*0.5;gl_Position=vec4(a_pos,0.0,1.0);}`;

const FS = `precision highp float;
varying vec2 v_uv;
uniform vec2  u_res;
uniform float u_time;
uniform vec3  u_base0;
uniform vec3  u_base1;
uniform vec3  u_bloom[4];
uniform vec4  u_orbit[4];   // xy = centre, zw = drift radius
uniform float u_count;
uniform float u_flutes;
uniform float u_refract;
uniform float u_aberr;
uniform float u_grain;
uniform float u_beam;
uniform float u_spread;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

// The scene behind the glass: a gradient plus slow, soft gaussian blooms.
vec3 scene(vec2 uv){
  float aspect = u_res.x / u_res.y;
  vec3 col = mix(u_base1, u_base0, smoothstep(0.0, 1.0, uv.y));
  for (int i = 0; i < 4; i++) {
    if (float(i) >= u_count) break;
    vec4 o = u_orbit[i];
    float t = u_time * (0.05 + 0.02 * float(i));
    vec2 c = o.xy + o.zw * vec2(sin(t + float(i) * 2.1), cos(t * 0.8 + float(i) * 1.3));
    vec2 d = uv - c;
    d.x *= aspect;
    d.x *= mix(1.0, 2.6, u_beam);           // beam: narrow horizontally
    d.y *= mix(1.0, 0.45, u_beam);          // ...and stretch vertically
    float r = u_spread * (0.85 + 0.3 * sin(t * 1.7 + float(i)));
    float g = exp(-dot(d, d) / (r * r));
    col = mix(col, u_bloom[i], clamp(g, 0.0, 1.0) * 0.92);
  }
  return col;
}

void main(){
  vec2 uv = v_uv;

  // Fluted glass: each rib bends the scene sideways and is shaded at its seams.
  float shade = 1.0;
  vec2 bend = vec2(0.0);
  if (u_flutes > 0.5) {
    float f = fract(uv.x * u_flutes);
    float k = f - 0.5;
    bend.x = k * u_refract * 2.0 + sin(uv.y * 3.0 + u_time * 0.2) * u_refract * 0.15;
    shade = 1.0 - pow(abs(k) * 2.0, 5.0) * 0.38;     // dark seams
    shade += smoothstep(0.30, 0.0, abs(k + 0.22)) * 0.06; // soft highlight per rib
  }

  // Chromatic aberration: split channels sideways and slightly outward.
  vec2 fromCentre = uv - 0.5;
  vec2 split = (vec2(0.004, 0.0) + fromCentre * 0.006) * u_aberr + bend * 0.25 * u_aberr;
  vec3 col;
  col.r = scene(uv + bend + split).r;
  col.g = scene(uv + bend).g;
  col.b = scene(uv + bend - split).b;

  col *= shade;

  // Vignette
  float v = smoothstep(1.05, 0.25, length(fromCentre * vec2(1.1, 1.0)));
  col *= mix(0.62, 1.0, v);

  // Film grain (re-rolled ~24 times a second)
  float fr = floor(u_time * 24.0);
  float n = hash(gl_FragCoord.xy + fr * 17.31) - 0.5;
  col += n * u_grain;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function pickPreset(): Preset {
  let last = "";
  try { last = localStorage.getItem("glass-bg-last") ?? ""; } catch {}
  const pool = PRESETS.filter((p) => p.name !== last);
  const p = pool[Math.floor(Math.random() * pool.length)];
  try { localStorage.setItem("glass-bg-last", p.name); } catch {}
  return p;
}

export default function GlassShader({ zIndex = 0 }: { zIndex?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { fxEnabled } = useApp();

  useEffect(() => {
    if (!fxEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error("[glass]", gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error("[glass]", gl.getProgramInfoLog(prog)); return; }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    const p = pickPreset();
    const blooms = p.blooms.slice(0, 4);
    const bloomData = new Float32Array(12);
    const orbitData = new Float32Array(16);
    blooms.forEach((hex, i) => {
      bloomData.set(hexToRgb(hex), i * 3);
      // Random layout per visit, kept mostly on screen.
      const cx = 0.15 + Math.random() * 0.7;
      const cy = 0.15 + Math.random() * 0.7;
      orbitData.set([cx, cy, 0.05 + Math.random() * 0.12, 0.04 + Math.random() * 0.1], i * 4);
    });
    gl.uniform3fv(u("u_base0"), hexToRgb(p.base[0]));
    gl.uniform3fv(u("u_base1"), hexToRgb(p.base[1]));
    gl.uniform3fv(u("u_bloom"), bloomData);
    gl.uniform4fv(u("u_orbit"), orbitData);
    gl.uniform1f(u("u_count"), blooms.length);
    gl.uniform1f(u("u_flutes"), p.flutes);
    gl.uniform1f(u("u_refract"), p.refract);
    gl.uniform1f(u("u_aberr"), p.aberration);
    gl.uniform1f(u("u_grain"), p.grain);
    gl.uniform1f(u("u_beam"), p.beam);
    gl.uniform1f(u("u_spread"), p.spread);
    canvas.dataset.preset = p.name;

    const uRes = u("u_res");
    const uTime = u("u_time");
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const offset = Math.random() * 100; // start mid-drift so it never opens on the same frame
    const start = performance.now();
    let raf = 0;
    let running = true;
    const frame = () => {
      if (!running) return;
      gl.uniform1f(uTime, still ? offset : offset + (performance.now() - start) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!still) raf = requestAnimationFrame(frame);
    };
    frame();

    const onVis = () => {
      running = !document.hidden;
      if (running && !still) raf = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [fxEnabled]);

  if (!fxEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex,
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
}
