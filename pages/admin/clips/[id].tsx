import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/admin/AdminLayout";
import DevicePreview from "@/components/admin/DevicePreview";
import { withAdminAuth } from "@/lib/admin/withAdminAuth";
import { getClip } from "@/lib/clips/store";
import {
  type Clip,
  type Palette,
  type BlendMode,
  type StartMode,
  type Orientation,
  type MobileZoom,
  type HoverEffect,
  type HoverSettings,
  PALETTES,
  BLEND_MODES,
  START_MODES,
  ORIENTATIONS,
  MOBILE_ZOOMS,
  HOVER_EFFECTS,
} from "@/lib/clips/types";
import { FX_MODES, MODE_SPECS, defaultParams, type FxMode, type FxParams } from "@/lib/fx/effects";

interface Props {
  initialClip: Clip;
}

export const getServerSideProps = withAdminAuth<Props>(async (ctx) => {
  const id = ctx.params?.id;
  if (typeof id !== "string") return { notFound: true as const };
  const clip = await getClip(id);
  if (!clip) return { notFound: true as const };
  return { props: { initialClip: JSON.parse(JSON.stringify(clip)) } };
});

export default function ClipEditor({ initialClip }: Props) {
  const router = useRouter();
  const [clip, setClip] = useState<Clip>(initialClip);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipFirst = useRef(true);
  // Increment whenever the clip changes so the preview iframes know to refresh
  // their cache key. (They also poll on a 1s timer for live edits.)
  const [previewRev, setPreviewRev] = useState(0);

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSaving(true);
      setError(null);
      try {
        const { id, createdAt, updatedAt, ...rest } = clip;
        const res = await fetch(`/api/admin/clips/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(rest),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => null);
          throw new Error(j?.error ?? `Save failed (${res.status})`);
        }
        setSavedAt(Date.now());
        setPreviewRev((r) => r + 1);
      } catch (e) {
        setError(e instanceof Error ? e.message : "save failed");
      } finally {
        setSaving(false);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [clip]);

  function update<K extends keyof Clip>(k: K, v: Clip[K]) {
    setClip((c) => ({ ...c, [k]: v }));
  }

  async function remove() {
    if (!confirm("Delete this clip?")) return;
    await fetch(`/api/admin/clips/${clip.id}`, { method: "DELETE" });
    router.push("/admin");
  }

  return (
    <>
      <Head>
        <title>{`Admin · ${clip.name || "Clip"}`}</title>
      </Head>
      <AdminLayout>
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <input
            value={clip.name}
            onChange={(e) => update("name", e.target.value)}
            className="text-xl font-semibold bg-transparent border-b border-gray-800 focus:border-gray-500 focus:outline-none px-1 py-1 min-w-[240px] flex-1"
            placeholder="untitled clip"
          />
          <span className="text-xs mr-2">
            {error ? (
              <span className="text-red-400">{error}</span>
            ) : saving ? (
              <span className="text-gray-500">Saving…</span>
            ) : savedAt ? (
              <span className="text-gray-500">Saved {new Date(savedAt).toLocaleTimeString()}</span>
            ) : null}
          </span>
          <button
            onClick={remove}
            className="px-3 py-1.5 rounded text-xs uppercase tracking-widest bg-red-900/30 text-red-300 border border-red-900 hover:border-red-700"
          >
            Delete
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: video + visibility */}
          <div className="space-y-5">
            <Section title="Video">
              <Row label="Public">
                <Toggle checked={clip.isPublic} onChange={(v) => update("isPublic", v)} />
              </Row>
              <Row label="URL">
                <input
                  type="text"
                  value={clip.videoUrl}
                  onChange={(e) => update("videoUrl", e.target.value)}
                  placeholder="https://devnet.irys.xyz/..."
                  className="bg-gray-900 border border-gray-700 rounded px-2 py-1 font-mono text-xs w-full"
                />
              </Row>
              <Row label="Sort">
                <input
                  type="number"
                  value={clip.sortOrder}
                  onChange={(e) => update("sortOrder", parseInt(e.target.value, 10) || 0)}
                  className="bg-gray-900 border border-gray-700 rounded px-2 py-1 w-20"
                />
              </Row>
              <Row label="Weight">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={clip.weight}
                  onChange={(e) => update("weight", parseInt(e.target.value, 10) || 1)}
                  className="bg-gray-900 border border-gray-700 rounded px-2 py-1 w-20"
                />
              </Row>
            </Section>

            <Section title="Layout">
              <Row label="Orientation">
                <select
                  value={clip.orientation}
                  onChange={(e) => update("orientation", e.target.value as Orientation)}
                  className="bg-gray-900 border border-gray-700 rounded px-2 py-1"
                >
                  {ORIENTATIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </Row>
              <Row label="Mobile zoom">
                <select
                  value={clip.mobileZoom}
                  onChange={(e) => update("mobileZoom", e.target.value as MobileZoom)}
                  className="bg-gray-900 border border-gray-700 rounded px-2 py-1"
                >
                  {MOBILE_ZOOMS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </Row>
            </Section>

            <Section title="Start time">
              <Row label="Mode">
                <select
                  value={clip.startMode}
                  onChange={(e) => update("startMode", e.target.value as StartMode)}
                  className="bg-gray-900 border border-gray-700 rounded px-2 py-1"
                >
                  {START_MODES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Row>
              {clip.startMode === "window" && (
                <>
                  <Row label="Min (sec)">
                    <input
                      type="number"
                      step="0.5"
                      value={clip.startWindowMinSec ?? 0}
                      onChange={(e) =>
                        update("startWindowMinSec", parseFloat(e.target.value) || 0)
                      }
                      className="bg-gray-900 border border-gray-700 rounded px-2 py-1 w-24"
                    />
                  </Row>
                  <Row label="Max (sec)">
                    <input
                      type="number"
                      step="0.5"
                      value={clip.startWindowMaxSec ?? 0}
                      onChange={(e) =>
                        update("startWindowMaxSec", parseFloat(e.target.value) || 0)
                      }
                      className="bg-gray-900 border border-gray-700 rounded px-2 py-1 w-24"
                    />
                  </Row>
                </>
              )}
              {clip.startMode === "fixed" && (
                <Row label="Always start at (sec)">
                  <input
                    type="number"
                    step="0.5"
                    value={clip.startFixedSec ?? 0}
                    onChange={(e) => update("startFixedSec", parseFloat(e.target.value) || 0)}
                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 w-24"
                  />
                </Row>
              )}
              <Slider
                label="Min segment (sec)"
                min={2}
                max={120}
                step={1}
                value={clip.segmentMinSec}
                onChange={(v) => update("segmentMinSec", v)}
              />
              <Slider
                label="Max segment (sec)"
                min={3}
                max={300}
                step={1}
                value={clip.segmentMaxSec}
                onChange={(v) => update("segmentMaxSec", v)}
              />
            </Section>
          </div>

          {/* Right: per-clip FX + live device preview */}
          <div className="space-y-5">
            <Section title="Shader mode">
              <div className="grid grid-cols-4 gap-1.5">
                {FX_MODES.map((m) => (
                  <button
                    key={m}
                    onClick={() => update("fxMode", m)}
                    className={`px-2 py-1.5 rounded text-[10px] uppercase tracking-widest border ${
                      clip.fxMode === m
                        ? "bg-amber-500 text-black border-amber-500"
                        : "bg-gray-900 border-gray-700 hover:border-gray-500 text-gray-300"
                    }`}
                  >
                    {MODE_SPECS[m].label}
                  </button>
                ))}
              </div>
              <Slider
                label="FX wet/dry"
                min={0}
                max={1}
                step={0.01}
                value={clip.fxWet}
                onChange={(v) => update("fxWet", v)}
                hint="0 = raw video · 1 = full shader effect"
              />
            </Section>

            {/* Per-mode params dynamically from MODE_SPECS */}
            {MODE_SPECS[clip.fxMode].effects.length > 0 && (
              <Section title={`${MODE_SPECS[clip.fxMode].label} params`}>
                {MODE_SPECS[clip.fxMode].effects.map((eff) => (
                  <div key={eff.type} className="space-y-2.5 mt-1 first:mt-0">
                    {eff.params.length === 0 && (
                      <p className="text-[11px] text-gray-500">preset — no params</p>
                    )}
                    {eff.params.map((p) => {
                      const cur =
                        clip.fxParams?.[clip.fxMode]?.[eff.type]?.[p.key] ?? p.default;
                      const setVal = (val: number | string) => {
                        const next: FxParams = JSON.parse(
                          JSON.stringify(clip.fxParams ?? defaultParams())
                        );
                        if (!next[clip.fxMode]) next[clip.fxMode] = {};
                        if (!next[clip.fxMode][eff.type]) next[clip.fxMode][eff.type] = {};
                        next[clip.fxMode][eff.type][p.key] = val;
                        update("fxParams", next);
                      };
                      if (p.type === "select") {
                        return (
                          <Row key={p.key} label={p.label}>
                            <select
                              value={String(cur)}
                              onChange={(e) => setVal(e.target.value)}
                              className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs"
                            >
                              {p.options!.map((o) => (
                                <option key={o} value={o}>
                                  {o}
                                </option>
                              ))}
                            </select>
                          </Row>
                        );
                      }
                      if (p.type === "color") {
                        return (
                          <Row key={p.key} label={p.label}>
                            <input
                              type="color"
                              value={String(cur)}
                              onChange={(e) => setVal(e.target.value)}
                              className="w-12 h-7 border border-gray-700 bg-transparent rounded"
                            />
                          </Row>
                        );
                      }
                      return (
                        <Slider
                          key={p.key}
                          label={p.label}
                          min={p.min ?? 0}
                          max={p.max ?? 1}
                          step={p.step ?? 0.01}
                          value={Number(cur)}
                          onChange={(v) => setVal(v)}
                        />
                      );
                    })}
                  </div>
                ))}
              </Section>
            )}

            <Section title="Mouse hover FX">
              <Row label="Enabled">
                <Toggle
                  checked={clip.hover.enabled}
                  onChange={(v) =>
                    update("hover", { ...clip.hover, enabled: v } as HoverSettings)
                  }
                />
              </Row>
              {clip.hover.enabled && (
                <>
                  <Row label="Effect">
                    <select
                      value={clip.hover.effect}
                      onChange={(e) =>
                        update("hover", {
                          ...clip.hover,
                          effect: e.target.value as HoverEffect,
                        } as HoverSettings)
                      }
                      className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs"
                    >
                      {HOVER_EFFECTS.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </Row>
                  <Slider
                    label="Radius"
                    min={0.05}
                    max={0.6}
                    step={0.01}
                    value={clip.hover.radius}
                    onChange={(v) =>
                      update("hover", { ...clip.hover, radius: v } as HoverSettings)
                    }
                  />
                  <Slider
                    label="Intensity"
                    min={0}
                    max={1}
                    step={0.01}
                    value={clip.hover.intensity}
                    onChange={(v) =>
                      update("hover", { ...clip.hover, intensity: v } as HoverSettings)
                    }
                  />
                </>
              )}
            </Section>

            <Section title="Dither wall overlay">
              <Slider
                label="Dither alpha"
                min={0}
                max={1}
                step={0.01}
                value={clip.fxDitherIntensity}
                onChange={(v) => update("fxDitherIntensity", v)}
                hint="Standalone Bayer dither layer on top of the clip"
              />
              <Row label="Palette">
                <select
                  value={clip.fxPalette}
                  onChange={(e) => update("fxPalette", e.target.value as Palette)}
                  className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs"
                >
                  {PALETTES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </Row>
              <Row label="Blend mode">
                <select
                  value={clip.fxBlendMode}
                  onChange={(e) => update("fxBlendMode", e.target.value as BlendMode)}
                  className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs"
                >
                  {BLEND_MODES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </Row>
            </Section>

            <DevicePreview clipId={clip.id} revKey={previewRev} />

            <p className="text-xs text-gray-500">
              Previews live-poll every 1 s — drag any slider on the left and
              watch both frames react. The home page picks public clips weighted
              by <code className="font-mono text-amber-400">weight</code>.
            </p>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm uppercase tracking-widest text-gray-500">{title}</h2>
      <div className="bg-gray-900 border border-gray-800 rounded-md p-4 space-y-3">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-300">{label}</span>
      <div>{children}</div>
    </div>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  hint,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-gray-300">{label}</span>
        <span className="text-xs font-mono text-gray-500">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
      {hint && <div className="text-xs text-gray-500">{hint}</div>}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full relative transition-colors ${
        checked ? "bg-green-600" : "bg-gray-700"
      }`}
    >
      <span
        className={`absolute top-0.5 ${checked ? "left-6" : "left-0.5"} w-5 h-5 rounded-full bg-white transition-all`}
      />
    </button>
  );
}
