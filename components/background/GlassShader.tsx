"use client";

import { useEffect, useRef } from "react";
import { useApp } from "@/contexts/AppContext";

/**
 * Dark, out-of-focus backdrop, like a night photo taken wide open: a few
 * soft shapes (a pale figure, foliage, skin tones) drifting very slowly,
 * shaded by a side light and a deep vignette, with fine film grain.
 * A preset is picked at random on each visit (never the same twice in a
 * row) and its shapes get a fresh layout.
 * In light mode the same scene is shown as a foggy daytime shot: pale base,
 * the shapes as soft mid-tones, a lighter vignette. It fades between modes.
 */

type Bloom = [hex: string, size: number, strength: number];

type Preset = {
  name: string;
  base: [string, string]; // top → bottom
  blooms: Bloom[]; // up to 6
  grain: number;
};

const PRESETS: Preset[] = [
  {
    name: "night-garden",
    base: ["#0c1311", "#050807"],
    blooms: [["#8c8f93", 0.26, 0.75], ["#6b5749", 0.16, 0.7], ["#3a4c28", 0.12, 0.8], ["#2e3f21", 0.1, 0.8], ["#56656c", 0.2, 0.5]],
    grain: 0.07,
  },
  {
    name: "pool",
    base: ["#081014", "#030608"],
    blooms: [["#3c5660", 0.34, 0.7], ["#9aa2a4", 0.14, 0.55], ["#1d2e29", 0.2, 0.8]],
    grain: 0.07,
  },
  {
    name: "dim-room",
    base: ["#120f0d", "#060504"],
    blooms: [["#76594a", 0.24, 0.7], ["#382a21", 0.3, 0.8], ["#a8907c", 0.1, 0.5]],
    grain: 0.08,
  },
  {
    name: "fog-moss",
    base: ["#151a14", "#090c08"],
    blooms: [["#55624a", 0.3, 0.65], ["#868c7c", 0.16, 0.5], ["#283120", 0.14, 0.85], ["#283120", 0.1, 0.85]],
    grain: 0.08,
  },
  {
    name: "blue-hour",
    base: ["#0b0f18", "#04060a"],
    blooms: [["#384868", 0.32, 0.65], ["#868e9e", 0.12, 0.5], ["#1b2334", 0.22, 0.8]],
    grain: 0.07,
  },
  {
    name: "ash",
    base: ["#121212", "#070707"],
    blooms: [["#595957", 0.28, 0.6], ["#93918a", 0.12, 0.45], ["#262626", 0.2, 0.8]],
    grain: 0.08,
  },
  {
    name: "late-skin",
    base: ["#140d0c", "#070404"],
    blooms: [["#85604f", 0.22, 0.65], ["#472e2a", 0.3, 0.8], ["#b89e8d", 0.1, 0.45], ["#2c3a24", 0.1, 0.7]],
    grain: 0.07,
  },
];

const VS = `attribute vec2 a_pos;varying vec2 v_uv;void main(){v_uv=(a_pos+1.0)*0.5;gl_Position=vec4(a_pos,0.0,1.0);}`;

const FS = `precision highp float;
varying vec2 v_uv;
uniform vec2  u_res;
uniform float u_time;
uniform vec3  u_base0;
uniform vec3  u_base1;
uniform vec3  u_bloom[6];
uniform vec4  u_orbit[6];   // xy = centre, zw = drift radius
uniform vec2  u_shape[6];   // x = size, y = strength
uniform float u_count;
uniform float u_grain;
uniform vec2  u_light;      // direction the light comes from
uniform float u_day;        // 0 = night (dark mode), 1 = foggy day (light mode)

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

vec3 scene(vec2 uv){
  float aspect = u_res.x / u_res.y;
  // Day base: pale fog, faintly tinted by the preset's night colours.
  vec3 day0 = vec3(0.86, 0.855, 0.83) + (u_base0 - 0.06) * 1.6;
  vec3 day1 = vec3(0.80, 0.795, 0.77) + (u_base1 - 0.03) * 1.6;
  vec3 col = mix(mix(u_base1, day1, u_day), mix(u_base0, day0, u_day), smoothstep(0.0, 1.0, uv.y));
  float strength = mix(1.0, 0.78, u_day);
  for (int i = 0; i < 6; i++) {
    if (float(i) >= u_count) break;
    vec4 o = u_orbit[i];
    float t = u_time * (0.018 + 0.006 * float(i));
    vec2 c = o.xy + o.zw * vec2(sin(t + float(i) * 2.1), cos(t * 0.8 + float(i) * 1.3));
    vec2 d = uv - c;
    d.x *= aspect;
    float r = u_shape[i].x * 1.3 * (0.92 + 0.08 * sin(t * 1.3 + float(i)));
    float g = exp(-dot(d, d) / (r * r));
    col = mix(col, u_bloom[i], g * u_shape[i].y * strength);
  }
  return col;
}

void main(){
  vec2 uv = v_uv;
  vec2 fromCentre = uv - 0.5;

  // Faint lens fringing, only toward the edges.
  vec2 split = fromCentre * 0.0025;
  vec3 col;
  col.r = scene(uv + split).r;
  col.g = scene(uv).g;
  col.b = scene(uv - split).b;

  // Side light: one side of the frame a touch brighter than the other.
  float side = smoothstep(-0.7, 0.7, dot(fromCentre, u_light));
  col *= mix(0.82 + 0.3 * side, 0.93 + 0.1 * side, u_day);

  // Deep, soft vignette.
  float v = smoothstep(1.0, 0.2, length(fromCentre * vec2(1.15, 1.0)));
  col *= mix(mix(0.3, 1.0, v), mix(0.8, 1.0, v), u_day);

  // Muted film response: pull saturation down, lift the blacks slightly.
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(l), col, 0.82);
  col = col * 0.96 + vec3(0.012, 0.016, 0.018);

  // Fine grain, stronger in the shadows like film.
  float fr = floor(u_time * 12.0);
  float n = hash(gl_FragCoord.xy + fr * 17.31) - 0.5;
  col += n * u_grain * mix(1.0 - l * 0.6, 0.9, u_day);

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
  const { fxEnabled, darkMode } = useApp();
  const dayTarget = useRef(darkMode ? 0 : 1);
  const redraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    dayTarget.current = darkMode ? 0 : 1;
    redraw.current?.();
  }, [darkMode]);

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
    const blooms = p.blooms.slice(0, 6);
    const bloomData = new Float32Array(18);
    const orbitData = new Float32Array(24);
    const shapeData = new Float32Array(12);
    blooms.forEach(([hex, size, strength], i) => {
      bloomData.set(hexToRgb(hex), i * 3);
      // Big shapes sit nearer the middle; small ones (foliage) drift near the edges.
      const reach = size > 0.18 ? 0.36 : 0.44;
      const cx = 0.5 + (Math.random() * 2 - 1) * reach;
      const cy = 0.5 + (Math.random() * 2 - 1) * reach;
      orbitData.set([cx, cy, 0.02 + Math.random() * 0.04, 0.02 + Math.random() * 0.04], i * 4);
      shapeData.set([size, strength], i * 2);
    });
    const angle = Math.random() * Math.PI * 2;
    gl.uniform3fv(u("u_base0"), hexToRgb(p.base[0]));
    gl.uniform3fv(u("u_base1"), hexToRgb(p.base[1]));
    gl.uniform3fv(u("u_bloom"), bloomData);
    gl.uniform4fv(u("u_orbit"), orbitData);
    gl.uniform2fv(u("u_shape"), shapeData);
    gl.uniform1f(u("u_count"), blooms.length);
    gl.uniform1f(u("u_grain"), p.grain);
    gl.uniform2f(u("u_light"), Math.cos(angle), Math.sin(angle));
    canvas.dataset.preset = p.name;

    const uRes = u("u_res");
    const uTime = u("u_time");
    const uDay = u("u_day");
    let day = dayTarget.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let lastW = 0;
    let lastH = 0;
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Phones fire resize as the address bar slides while scrolling. The
      // scene is soft, so skip small height-only changes instead of
      // reallocating the canvas mid-scroll.
      if (w === lastW && Math.abs(h - lastH) < 160) return;
      lastW = w;
      lastH = h;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // The drift is slow; 30fps looks the same on touch devices and halves GPU work.
    const minGap = window.matchMedia("(pointer: coarse)").matches ? 1000 / 30 - 2 : 0;
    const offset = Math.random() * 100; // start mid-drift so it never opens on the same frame
    const start = performance.now();
    let raf = 0;
    let running = true;
    let lastDraw = 0;
    const frame = () => {
      if (!running) return;
      const now = performance.now();
      // Skip drawing while a full-screen modal covers the page (its blurred
      // backdrop would otherwise re-blur every frame) or between 30fps ticks.
      const covered = document.documentElement.dataset.modal === "1";
      if (!still && (covered || now - lastDraw < minGap)) {
        raf = requestAnimationFrame(frame);
        return;
      }
      lastDraw = now;
      // Ease toward the current mode so toggling dark/light fades the scene.
      day = still ? dayTarget.current : day + (dayTarget.current - day) * 0.08;
      if (Math.abs(dayTarget.current - day) < 0.002) day = dayTarget.current;
      gl.uniform1f(uDay, day);
      gl.uniform1f(uTime, still ? offset : offset + (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!still) raf = requestAnimationFrame(frame);
    };
    frame();
    // With reduced motion there is no loop, so redraw once when the mode changes.
    redraw.current = () => { if (still && running) frame(); };

    const onVis = () => {
      running = !document.hidden;
      cancelAnimationFrame(raf);
      if (running && !still) raf = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      running = false;
      redraw.current = null;
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
