import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/admin/AdminLayout";
import { withAdminAuth } from "@/lib/admin/withAdminAuth";
import { getClip } from "@/lib/clips/store";
import {
  type Clip,
  type Palette,
  type BlendMode,
  type StartMode,
  type Orientation,
  type MobileZoom,
  PALETTES,
  BLEND_MODES,
  START_MODES,
  ORIENTATIONS,
  MOBILE_ZOOMS,
} from "@/lib/clips/types";

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

          {/* Right: per-clip FX */}
          <div className="space-y-5">
            <Section title="Per-clip FX">
              <Slider
                label="Dither intensity"
                min={0}
                max={1}
                step={0.01}
                value={clip.fxDitherIntensity}
                onChange={(v) => update("fxDitherIntensity", v)}
                hint="0 = clip plays raw · 1 = dither maxed"
              />
              <Row label="Palette">
                <select
                  value={clip.fxPalette}
                  onChange={(e) => update("fxPalette", e.target.value as Palette)}
                  className="bg-gray-900 border border-gray-700 rounded px-2 py-1"
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
                  className="bg-gray-900 border border-gray-700 rounded px-2 py-1"
                >
                  {BLEND_MODES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </Row>
            </Section>
            <p className="text-xs text-gray-500">
              Changes save automatically. The home page picks public clips weighted by{" "}
              <code className="font-mono text-amber-400">weight</code> and applies these FX
              overrides while the clip plays.
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
