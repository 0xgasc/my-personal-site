"use client";

import { useEffect, useRef } from "react";
import { useApp } from "@/contexts/AppContext";

const VS = `attribute vec2 a_pos;varying vec2 v_uv;void main(){v_uv=vec2((a_pos.x+1.0)*0.5,1.0-(a_pos.y+1.0)*0.5);gl_Position=vec4(a_pos,0.0,1.0);}`;

// Procedural dither overlay — Bayer-quantized animated noise + gradient.
// Independent of any video texture, so it works on top of YouTube backdrops
// (which WebGL can't sample) just as well as on the scene shaders.
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
  for(int i=0;i<4;i++){ v+=a*noise(p); p*=2.03; a*=0.55; }
  return v;
}

void main(){
  vec2 uv = v_uv;

  // ─── Source field that we'll quantize via dither ─────────────
  float t = u_time * 0.18;
  float field = fbm(uv*2.5 + vec2(t*0.5, t*0.3));
  field += 0.35 * sin(uv.x*5.0 + t*1.4);
  field += 0.20 * sin((uv.x+uv.y)*7.0 - t*0.9);
  field += 0.10 * cos(uv.y*8.0 + t);
  // Optional mouse bulge — slight push outward of the field near cursor
  if (u_mouse.x >= 0.0) {
    vec2 d = uv - u_mouse;
    d.x *= u_viewport.x / max(u_viewport.y, 1.0);
    float k = exp(-dot(d,d)*22.0);
    field += k * 0.45;
  }
  field = clamp(field*0.6 + 0.4, 0.0, 1.0);

  // ─── 4-level Bayer dither ────────────────────────────────────
  float thr = bayer(gl_FragCoord.xy * 0.5);
  float levels = 4.0;
  float quant = floor(field*(levels-1.0) + thr) / (levels-1.0);

  // ─── Theme palette ───────────────────────────────────────────
  vec3 c0, c1, c2, c3;
  if (u_mode == 1) {
    // Day — beachy: deep ocean → seafoam → warm sand → sun cream
    c0 = vec3(0.04, 0.18, 0.30);
    c1 = vec3(0.22, 0.55, 0.62);
    c2 = vec3(0.93, 0.79, 0.55);
    c3 = vec3(1.00, 0.93, 0.74);
  } else {
    // Night — city neon: midnight → indigo → magenta → cyan
    c0 = vec3(0.02, 0.03, 0.08);
    c1 = vec3(0.14, 0.10, 0.30);
    c2 = vec3(0.76, 0.27, 0.56);
    c3 = vec3(0.22, 0.83, 0.96);
  }
  vec3 col;
  if (quant < 0.34) col = mix(c0, c1, quant/0.33);
  else if (quant < 0.67) col = mix(c1, c2, (quant-0.33)/0.33);
  else col = mix(c2, c3, (quant-0.66)/0.34);

  // Subtle grain for texture
  col += (hash(uv*u_viewport + u_time*60.0) - 0.5) * 0.04;

  // Layer alpha — leaves the underlying YT/scene visible
  gl_FragColor = vec4(col, 0.55);
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
