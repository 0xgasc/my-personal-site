"use client";

import { useEffect, useRef } from "react";
import { useApp } from "@/contexts/AppContext";

const VS = `attribute vec2 a_pos;varying vec2 v_uv;void main(){v_uv=vec2((a_pos.x+1.0)*0.5,1.0-(a_pos.y+1.0)*0.5);gl_Position=vec4(a_pos,0.0,1.0);}`;

// Two themed scenes drawn with simple gradient + noise math.
// u_mode: 0 = night (city skyline + neon haze)
//         1 = day  (beach horizon + sun)
const FS = `precision highp float;
varying vec2 v_uv;
uniform float u_time;
uniform int   u_mode;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
  vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x),
             mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x),u.y);
}

// ─── Night: city ──────────────────────────────────────────
vec3 cityNight(vec2 uv){
  // Vertical gradient: deep midnight → indigo → distant haze near horizon
  vec3 sky = mix(vec3(0.020,0.027,0.055), vec3(0.07,0.04,0.13), pow(uv.y, 1.8));
  sky = mix(sky, vec3(0.18,0.10,0.22), smoothstep(0.55,0.78,uv.y));        // mid haze
  sky = mix(sky, vec3(0.45,0.25,0.35), smoothstep(0.72,0.92,uv.y));        // horizon glow
  sky = mix(sky, vec3(0.95,0.78,0.55)*0.9, smoothstep(0.86,1.0,uv.y));     // city lights bleed

  // Distant moving haze / cloud layer
  float h = noise(vec2(uv.x*4.0 + u_time*0.02, uv.y*8.0)) * 0.08;
  sky += vec3(0.20,0.15,0.30) * h;

  // Skyline silhouettes — chunky stepped buildings
  float sky_h = 0.18 + 0.05*sin(uv.x*7.3) + 0.04*sin(uv.x*23.0 + 1.7) + 0.02*sin(uv.x*61.0);
  // Closer skyline
  float fg_h  = 0.10 + 0.04*sin(uv.x*11.7 + 2.1) + 0.03*sin(uv.x*37.0 + 0.8);
  vec3 col = sky;
  if (uv.y < sky_h) col = vec3(0.025,0.04,0.075);  // mid-distance silhouettes
  if (uv.y < fg_h)  col = vec3(0.012,0.018,0.04);  // foreground silhouettes

  // Window lights: tiny warm dots inside silhouettes
  if (uv.y < sky_h && uv.y > 0.005) {
    vec2 grid = floor(vec2(uv.x*180.0, uv.y*120.0));
    float lit = step(0.92, hash(grid));
    float warm = step(0.5, hash(grid + 1.7));
    col += lit * mix(vec3(0.95,0.78,0.32), vec3(0.45,0.72,0.95), warm) * 0.55;
  }

  // Neon accent rim where buildings meet sky
  float rim = smoothstep(sky_h-0.008, sky_h, uv.y) * smoothstep(sky_h+0.02, sky_h, uv.y);
  col += vec3(0.20,0.55,0.85) * rim * 0.7;

  // Subtle film grain
  col += (hash(uv*vec2(1280.0,720.0)+u_time)-0.5)*0.018;
  return col;
}

// ─── Day: beach ───────────────────────────────────────────
vec3 beachDay(vec2 uv){
  // Sky → sand vertical gradient
  vec3 sky_top = vec3(0.96,0.86,0.62);   // warm cream sky
  vec3 sky_mid = vec3(0.62,0.82,0.92);   // ocean-pale blue
  vec3 horizon = vec3(0.85,0.68,0.45);   // sun-bleached horizon
  vec3 ocean   = vec3(0.10,0.42,0.55);   // ocean teal
  vec3 sand    = vec3(0.93,0.83,0.62);   // warm sand
  vec3 col;

  float horizonY = 0.52;
  if (uv.y < horizonY - 0.18) {
    // Far sand bottom
    col = mix(sand, vec3(0.85,0.72,0.50), smoothstep(0.0,horizonY-0.18,uv.y));
  } else if (uv.y < horizonY) {
    // Ocean band
    float t = (uv.y - (horizonY-0.18)) / 0.18;
    col = mix(ocean, horizon, t);
    // Ripples
    col += vec3(0.10,0.18,0.20) * 0.5 *
      sin(uv.x*40.0 + u_time*0.6 + sin(uv.y*60.0)*1.2) *
      smoothstep(0.0,0.4,t);
  } else {
    // Sky above horizon
    float t = (uv.y - horizonY) / (1.0 - horizonY);
    col = mix(horizon, sky_mid, smoothstep(0.0,0.4,t));
    col = mix(col, sky_top, smoothstep(0.5,1.0,t));
  }

  // Sun disc + halo
  vec2 sunPos = vec2(0.7, horizonY + 0.05);
  float d = distance(uv, sunPos);
  float sun = smoothstep(0.038,0.022,d);
  float halo = smoothstep(0.18,0.0,d) * 0.45;
  col = mix(col, vec3(1.0,0.93,0.72), sun);
  col += vec3(1.0,0.78,0.45) * halo;

  // Drifting soft clouds
  float clouds = noise(uv*vec2(3.0,8.0) + vec2(u_time*0.015,0.0)) * smoothstep(horizonY+0.05,1.0,uv.y);
  col += vec3(1.0,0.96,0.88) * clouds * 0.18;

  // Sand glitter
  if (uv.y < horizonY - 0.18) {
    col += hash(uv*vec2(800.0,400.0))*0.05;
  }
  return col;
}

void main(){
  vec3 col = (u_mode == 1) ? beachDay(v_uv) : cityNight(v_uv);
  // Subtle vignette so content still pops
  float vig = 1.0 - 0.30 * length(v_uv - 0.5);
  col *= mix(0.96, 1.0, vig);
  gl_FragColor = vec4(col, 1.0);
}`;

interface GenerativeShaderProps {
  /**
   * When true, the shader renders as a translucent FX overlay on top of
   * whatever's beneath (e.g. a YouTube background) via mix-blend-mode.
   * Otherwise it renders opaque as a standalone backdrop.
   */
  overlay?: boolean;
}

export default function GenerativeShader({ overlay = false }: GenerativeShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { fxEnabled, darkMode } = useApp();

  // Keep a ref to the latest mode so the rAF loop reads fresh values
  // without restarting on each theme toggle.
  const modeRef = useRef(darkMode ? 0 : 1);
  modeRef.current = darkMode ? 0 : 1;

  useEffect(() => {
    if (!fxEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { premultipliedAlpha: false, antialias: false });
    if (!gl) return;

    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, VS); gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) { console.error("VS", gl.getShaderInfoLog(vs)); return; }

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, FS); gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) { console.error("FS", gl.getShaderInfoLog(fs)); return; }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error("LINK", gl.getProgramInfoLog(prog)); return; }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uMode = gl.getUniformLocation(prog, "u_mode");

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const gl2: WebGLRenderingContext = gl;
    let running = true;
    const start = performance.now();

    function frame() {
      if (!running) return;
      if (uTime) gl2.uniform1f(uTime, (performance.now() - start) / 1000);
      if (uMode) gl2.uniform1i(uMode, modeRef.current);
      gl2.drawArrays(gl2.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(frame);
    }
    frame();
    return () => {
      running = false;
      window.removeEventListener("resize", resize);
    };
  }, [fxEnabled]);

  if (!fxEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none",
        display: "block",
        // Overlay mode: translucent + soft-light blend so the scene
        // colorizes/tints the underlying video instead of replacing it.
        opacity: overlay ? 0.55 : 1,
        mixBlendMode: overlay ? "soft-light" : undefined,
      }}
    />
  );
}
