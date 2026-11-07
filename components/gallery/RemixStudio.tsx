"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import FxCanvas from "@/components/background/FxCanvas";
import { defaultParams, MODE_SPECS, type FxMode, type FxParams } from "@/lib/fx/effects";

export interface RemixStrings {
  wet: string;
  amount: string;
  palette: string;
  save: string;
  submit: string;
  name: string;
  note: string;
  send: string;
  sending: string;
  sent: string;
  failed: string;
}

interface Props {
  src: string;
  title: string;
  link?: string;
  strings: RemixStrings;
}

const MODES: FxMode[] = ["crt", "vhs", "dream", "ascii", "pixel", "dither"];

/** Where each mode keeps its palette (only ASCII and dither recolor). */
const PALETTE_PATH: Partial<Record<FxMode, [string, string]>> = {
  ascii: ["ascii", "ascii"],
  dither: ["dither", "dithering"],
};

function paletteOptions(mode: FxMode): string[] {
  const path = PALETTE_PATH[mode];
  if (!path) return [];
  const spec = MODE_SPECS[mode].effects.find((e) => e.type === path[1]);
  const p = spec?.params.find((x) => x.key === "palette");
  return (p?.options as string[] | undefined) ?? [];
}

/** One "amount" knob (0..1) per mode, mapped onto the param that matters most. */
function buildParams(mode: FxMode, amount: number, palette: string): FxParams {
  const p = defaultParams();
  const set = (m: string, e: string, k: string, v: number | string) => {
    p[m] = p[m] ?? {};
    p[m][e] = { ...(p[m][e] ?? {}), [k]: v };
  };
  const lerp = (a: number, b: number) => a + (b - a) * amount;
  switch (mode) {
    case "crt":
      set("crt", "crt", "scanlineIntensity", lerp(0.15, 1));
      set("crt", "crt", "barrelDistortion", lerp(0, 0.28));
      set("crt", "crt", "chromaticAberration", lerp(0.05, 0.9));
      set("crt", "crt", "flickerIntensity", 0.03);
      break;
    case "vhs":
      set("vhs", "chromatic-aberration", "intensity", lerp(0.2, 3));
      break;
    case "dream":
      set("dream", "bloom", "bloomIntensity", lerp(0.3, 3));
      set("dream", "bloom", "bloomThreshold", lerp(0.75, 0.25));
      break;
    case "ascii":
      set("ascii", "ascii", "cellSize", Math.round(lerp(18, 5)));
      break;
    case "pixel":
      set("pixel", "pixelation", "cellSize", Math.round(lerp(3, 36)));
      break;
    case "dither":
      set("dither", "dithering", "pixelSize", Math.round(lerp(1, 8)));
      set("dither", "dithering", "levels", Math.round(lerp(6, 2)));
      break;
  }
  const path = PALETTE_PATH[mode];
  if (path && palette) set(path[0], path[1], "palette", palette);
  return p;
}

/** Downscale a capture so submissions stay small. */
function shrink(dataUrl: string, maxSide = 1400, quality = 0.86): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      if (scale === 1) return resolve(dataUrl);
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

const chip = (active: boolean) =>
  `px-3 py-1.5 sm:px-2.5 sm:py-1 text-xs rounded-full border transition-colors ${
    active ? "bg-white text-black border-white" : "border-white/20 text-white/70 hover:text-white hover:border-white/50"
  }`;

export default function RemixStudio({ src, title, link, strings: s }: Props) {
  const [mode, setMode] = useState<FxMode>("dither");
  const [wet, setWet] = useState(1);
  const [amount, setAmount] = useState(0.5);
  const [palette, setPalette] = useState("");
  const [ratio, setRatio] = useState<number | null>(null);
  const [form, setForm] = useState(false);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [error, setError] = useState("");
  const captureRef = useRef<((q?: number) => string | null) | null>(null);

  // Size the canvas to the artwork so the shader's cover-fit shows all of it.
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setRatio(img.naturalWidth / Math.max(1, img.naturalHeight));
    img.onerror = () => setRatio(1);
    img.src = src;
  }, [src]);

  const palettes = paletteOptions(mode);
  useEffect(() => setPalette(paletteOptions(mode)[0] ?? ""), [mode]);
  const params = useMemo(() => buildParams(mode, amount, palette), [mode, amount, palette]);

  async function capture(): Promise<string | null> {
    const raw = captureRef.current?.(0.92);
    return raw ? shrink(raw) : null;
  }

  async function save() {
    const url = await capture();
    if (!url) return;
    const filename = `${(title || "remix").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${mode}.jpg`;
    // Phones: the share sheet is how you get an image into Photos.
    if (window.matchMedia("(pointer: coarse)").matches && navigator.canShare) {
      try {
        const blob = await (await fetch(url)).blob();
        const file = new File([blob], filename, { type: "image/jpeg" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file] });
          return;
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const image = await capture();
    if (!image) return;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          image,
          name,
          note,
          website,
          piece: { title, src, link: link ?? "" },
          fx: { mode, wet, amount },
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error ?? "");
      }
      setStatus("sent");
    } catch (err) {
      setStatus("failed");
      setError(err instanceof Error ? err.message : "");
    }
  }

  const label = "text-[11px] uppercase tracking-widest text-white/45";

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div
        className="relative overflow-hidden rounded-lg shadow-2xl bg-black/40"
        style={{
          aspectRatio: ratio ? String(ratio) : "1",
          width: ratio ? `min(100%, 90vw, calc(58dvh * ${ratio}))` : "min(100%, 90vw, 58dvh)",
          visibility: ratio ? "visible" : "hidden",
        }}
      >
        <FxCanvas
          videoUrl={null}
          imageUrl={src}
          videoOpacity={1}
          videoBlur={0}
          mode={mode}
          params={params}
          wet={wet}
          fixed={false}
          captureRef={captureRef}
        />
      </div>

      <div className="w-full max-w-xl flex flex-col gap-3 text-white">
        <div className="flex flex-wrap gap-1.5 justify-center">
          {MODES.map((m) => (
            <button key={m} type="button" className={chip(mode === m)} onClick={() => setMode(m)}>
              {m}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2">
          <span className={label}>{s.wet}</span>
          <input type="range" min={0} max={1} step={0.01} value={wet} onChange={(e) => setWet(Number(e.target.value))} className="accent-white h-8" />
          <span className={label}>{s.amount}</span>
          <input type="range" min={0} max={1} step={0.01} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="accent-white h-8" />
          {palettes.length > 1 && (
            <>
              <span className={label}>{s.palette}</span>
              <div className="flex flex-wrap gap-1.5">
                {palettes.map((p) => (
                  <button key={p} type="button" className={chip(palette === p)} onClick={() => setPalette(p)}>
                    {p}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {!form ? (
          <div className="flex gap-2 justify-center pt-1">
            <button type="button" onClick={save} className="px-4 py-2 text-sm rounded-full border border-white/25 text-white/85 hover:border-white/60">
              {s.save}
            </button>
            <button type="button" onClick={() => setForm(true)} className="px-4 py-2 text-sm rounded-full bg-white text-black hover:bg-white/85">
              {s.submit}
            </button>
          </div>
        ) : status === "sent" ? (
          <p className="text-center text-sm text-white/75">{s.sent}</p>
        ) : (
          <form onSubmit={send} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                placeholder={s.name}
                className="w-1/3 min-w-0 px-3 py-2 text-base sm:text-sm rounded-md bg-white/10 border border-white/15 focus:outline-none focus:border-white/50 placeholder:text-white/40"
              />
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={280}
                placeholder={s.note}
                className="flex-1 min-w-0 px-3 py-2 text-base sm:text-sm rounded-md bg-white/10 border border-white/15 focus:outline-none focus:border-white/50 placeholder:text-white/40"
              />
            </div>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="absolute -left-[9999px] w-px h-px opacity-0"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="self-center px-5 py-2 text-sm rounded-full bg-white text-black hover:bg-white/85 disabled:opacity-50"
            >
              {status === "sending" ? s.sending : s.send}
            </button>
            {status === "failed" && <p className="text-center text-xs text-red-300">{error || s.failed}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
