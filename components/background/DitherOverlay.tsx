"use client";

import { useEffect, useRef } from "react";
import { useApp } from "@/contexts/AppContext";

const VS = `attribute vec2 a_pos;varying vec2 v_uv;void main(){v_uv=vec2((a_pos.x+1.0)*0.5,1.0-(a_pos.y+1.0)*0.5);gl_Position=vec4(a_pos,0.0,1.0);}`;

// Procedural dither overlay — RGB-split Bayer-quantized animated field.
// Trippy af mode: swirl distortion, chromatic aberration at the dither
// level, mouse vortex, hue rotation. Independent of any video texture.
const FS = `precision highp float;
varying vec2 v_uv;
uniform float u_time;
uniform int   u_mode;       // 0 = night, 1 = day
uniform vec2  u_viewport;
uniform vec2  u_mouse;      // 0..1 normalized; (-1,-1) = inactive

float bayer(vec2 p){
  int x=int(mod(p.x,4.0));int y=int(mod(p.y,4.0));int idx=x+y*4;
  float arr[16];
  arr[0]=0.0; arr[1]=8.0; arr[2]=2.0; arr[3]=10.0;
  arr[4]=12.0;arr[5]=4.0; arr[6]=14.0;arr[7]=6.0;
  arr[8]=3.0; arr[9]=11.0;arr[10]=1.0;arr[11]=9.0;
  arr[12]=15.0;arr[13]=7.0;arr[14]=13.0;arr[15]=5.0;
  float v=0.0;
  for(int i=0;i<16;i++){ if(i==idx) v=arr[i]; }
  return v/16.0;
}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
  vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x),
             mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x),u.y);
}
float fbm(vec2 p){
  float v=0.0; float a=0.5;
  for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.03; a*=0.55; }
  return v;
}

// Swirl distortion around an anchor point. Stronger near the anchor.
vec2 swirl(vec2 uv, vec2 anchor, float strength, float twist){
  vec2 c = uv - anchor;
  float r = length(c);
  float a = atan(c.y, c.x) + twist / (r * 8.0 + 0.4) * strength;
  return anchor + vec2(cos(a), sin(a)) * r;
}

// Compute the animated 0..1 field at a given UV (used 3x for RGB split).
float computeField(vec2 uv){
  float t = u_time * 0.42;
  float f = fbm(uv*3.2 + vec2(t*0.9, t*0.5));
  f += 0.55 * sin(uv.x*9.0 + t*2.6 + sin(t*0.3)*1.5);
  f += 0.40 * sin((uv.x+uv.y)*11.0 - t*1.9);
  f += 0.30 * cos(uv.y*14.0 + t*1.4);
  f += 0.20 * sin(uv.x*22.0 + cos(t*0.6)*3.0);
  if (u_mouse.x >= 0.0) {
    vec2 d = uv - u_mouse;
    d.x *= u_viewport.x / max(u_viewport.y, 1.0);
    float k = exp(-dot(d,d)*12.0);
    f += k * 1.2;
  }
  return clamp(f*0.6 + 0.4, 0.0, 1.0);
}

void main(){
  vec2 uv = v_uv;
  float t = u_time;

  // ─── Swirl distortion — mouse is the vortex center if present ──
  vec2 anchor = u_mouse.x >= 0.0 ? u_mouse : vec2(0.5);
  float mouseStrength = u_mouse.x >= 0.0 ? 1.6 : 0.5;
  uv = swirl(uv, anchor, mouseStrength, 1.2 + 0.4 * sin(t*0.3));
  // Subtle global wobble
  uv += 0.012 * vec2(sin(uv.y*8.0 + t*0.7), cos(uv.x*8.0 - t*0.5));

  // ─── RGB-split: sample the field at three offset UVs ───────────
  float ca = 0.012 + 0.006*sin(t*0.6);
  vec2 dir = normalize(uv - 0.5 + 0.001);
  float fR = computeField(uv + dir * ca);
  float fG = computeField(uv);
  float fB = computeField(uv - dir * ca);

  // ─── Bayer dither, chunky pixels ───────────────────────────────
  float thr = bayer(gl_FragCoord.xy * 0.32);
  float levels = 5.0;
  float qR = floor(fR*(levels-1.0) + thr) / (levels-1.0);
  float qG = floor(fG*(levels-1.0) + thr) / (levels-1.0);
  float qB = floor(fB*(levels-1.0) + thr) / (levels-1.0);

  // ─── Hue-cycling palette ───────────────────────────────────────
  vec3 c0, c1, c2, c3;
  if (u_mode == 1) {
    // Day — beachy psychedelic
    c0 = vec3(0.03, 0.15, 0.28);
    c1 = vec3(0.95, 0.46, 0.55);   // sunset coral pop
    c2 = vec3(0.20, 0.78, 0.80);   // bright seafoam
    c3 = vec3(1.00, 0.93, 0.55);   // sun cream
  } else {
    // Night — neon city psychedelic
    c0 = vec3(0.01, 0.02, 0.10);
    c1 = vec3(0.78, 0.14, 0.66);   // hot magenta
    c2 = vec3(0.30, 0.95, 0.95);   // electric cyan
    c3 = vec3(0.92, 0.92, 0.40);   // acid yellow
  }
  // Cycle which palette stops anchor low/high every ~30s.
  float cycle = fract(t / 30.0);
  vec3 p0 = c0;
  vec3 p1 = mix(c1, c2, smoothstep(0.0, 1.0, cycle));
  vec3 p2 = mix(c2, c3, smoothstep(0.0, 1.0, cycle));
  vec3 p3 = mix(c3, c1, smoothstep(0.0, 1.0, cycle));

  // Per-channel palette mapping inlined below (GLSL ES 1.0 disallows
  // nested function defs).
  vec3 colR, colG, colB;
  if (qR < 0.34) colR = mix(p0, p1, qR/0.33);
  else if (qR < 0.67) colR = mix(p1, p2, (qR-0.33)/0.33);
  else colR = mix(p2, p3, (qR-0.66)/0.34);
  if (qG < 0.34) colG = mix(p0, p1, qG/0.33);
  else if (qG < 0.67) colG = mix(p1, p2, (qG-0.33)/0.33);
  else colG = mix(p2, p3, (qG-0.66)/0.34);
  if (qB < 0.34) colB = mix(p0, p1, qB/0.33);
  else if (qB < 0.67) colB = mix(p1, p2, (qB-0.33)/0.33);
  else colB = mix(p2, p3, (qB-0.66)/0.34);

  // Mix per-channel into final color: R from R-shifted, G from middle,
  // B from B-shifted. Punchy chromatic-aberration look.
  vec3 col = vec3(colR.r, colG.g, colB.b);

  // Scanline modulation — faint horizontal CRT vibe
  col *= 0.92 + 0.08 * sin(gl_FragCoord.y * 1.2 + t * 0.5);

  // Heavy grain
  col += (hash(uv*u_viewport + t*60.0) - 0.5) * 0.06;

  // Slight overall brightness boost so it stays vivid through soft-light blend
  col = clamp(col * 1.05, 0.0, 1.0);

  gl_FragColor = vec4(col, 0.92);
}`;

interface Props {
  zIndex?: number;
  /** CSS mix-blend-mode applied to the overlay. */
  blendMode?: React.CSSProperties["mixBlendMode"];
  /** Alpha multiplier 0..1 on the whole overlay. */
  opacity?: number;
}

export default function DitherOverlay({
  zIndex = -1,
  blendMode = "soft-light",
  opacity = 1,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { fxEnabled, darkMode } = useApp();
  const modeRef = useRef(darkMode ? 0 : 1);
  modeRef.current = darkMode ? 0 : 1;
  const mouseRef = useRef({ x: -1, y: -1 });

  useEffect(() => {
    if (!fxEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: false, antialias: false });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error("DitherOverlay", gl.getShaderInfoLog(sh));
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
      console.error("DitherOverlay link", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uMode = gl.getUniformLocation(prog, "u_mode");
    const uViewport = gl.getUniformLocation(prog, "u_viewport");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / Math.max(rect.width, 1);
      mouseRef.current.y = (e.clientY - rect.top) / Math.max(rect.height, 1);
    };
    const onLeave = () => {
      mouseRef.current.x = -1;
      mouseRef.current.y = -1;
    };
    window.addEventListener("pointermove", onPointer);
    document.addEventListener("mouseleave", onLeave);

    let raf = 0;
    const start = performance.now();
    function frame() {
      if (uTime) gl!.uniform1f(uTime, (performance.now() - start) / 1000);
      if (uMode) gl!.uniform1i(uMode, modeRef.current);
      if (uViewport) gl!.uniform2f(uViewport, canvas!.width, canvas!.height);
      if (uMouse) gl!.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [fxEnabled]);

  if (!fxEnabled) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex,
        pointerEvents: "none",
        display: "block",
        opacity,
        mixBlendMode: blendMode,
      }}
    />
  );
}
