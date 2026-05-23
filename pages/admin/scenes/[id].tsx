import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/admin/AdminLayout";
import StashUpload from "@/components/admin/StashUpload";
import EffectsPanel from "@/components/admin/EffectsPanel";
import ScenePreview from "@/components/background/ScenePreview";
import { withAdminAuth } from "@/lib/admin/withAdminAuth";
import { getStore, getStoreMode } from "@/lib/store";
import type { Scene, ThemeOverride, BlendMode } from "@/lib/types";
import { BLEND_MODES } from "@/lib/types";
import type { FxMode, FxParams } from "@/lib/fx/effects";
import { defaultParams } from "@/lib/fx/effects";

interface PageProps {
  initialScene: Scene;
  storeMode: "local" | "remote";
}

export const getServerSideProps = withAdminAuth<PageProps>(async (ctx) => {
  const id = ctx.params?.id;
  if (typeof id !== "string") return { notFound: true as const };
  const store = getStore();
  const scene = await store.get(id);
  if (!scene) return { notFound: true as const };
  return {
    props: {
      initialScene: JSON.parse(JSON.stringify(scene)),
      storeMode: getStoreMode(),
    },
  };
});

export default function SceneEditorPage({ initialScene, storeMode }: PageProps) {
  const router = useRouter();
  const [scene, setScene] = useState<Scene>(initialScene);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [fxOpen, setFxOpen] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSave = useRef(true);

  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        const { id, createdAt, updatedAt, ...rest } = scene;
        const res = await fetch(`/api/admin/scenes/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(rest),
        });
        if (res.ok) {
          setSavedAt(Date.now());
          setSaveError(null);
        } else if (res.status === 404 || res.status === 500) {
          // Scene was deleted server-side — most likely from a wipe. Recreate
          // it instead of 500-looping forever. Preserves the in-progress edits.
          const recreateRes = await fetch("/api/admin/scenes", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(rest),
          });
          if (recreateRes.ok) {
            const json = (await recreateRes.json()) as { scene: Scene };
            router.replace(`/admin/scenes/${json.scene.id}`);
          } else {
            setSaveError(`Save failed (${res.status})`);
          }
        } else {
          setSaveError(`Save failed (${res.status})`);
        }
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "Save failed");
      } finally {
        setSaving(false);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [scene, router]);

  function update<K extends keyof Scene>(key: K, value: Scene[K]) {
    setScene((s) => ({ ...s, [key]: value }));
  }

  function handleParamChange(mode: FxMode, effectType: string, key: string, value: number | string) {
    setScene((s) => {
      const next: FxParams = JSON.parse(JSON.stringify(s.fxParams ?? defaultParams()));
      if (!next[mode]) next[mode] = {};
      if (!next[mode][effectType]) next[mode][effectType] = {};
      next[mode][effectType][key] = value;
      return { ...s, fxParams: next };
    });
  }

  async function remove() {
    if (!confirm("Delete this scene?")) return;
    await fetch(`/api/admin/scenes/${scene.id}`, { method: "DELETE" });
    router.push("/admin");
  }

  async function duplicate() {
    const { id, createdAt, updatedAt, ...rest } = scene;
    const res = await fetch("/api/admin/scenes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...rest, name: `${scene.name} copy`, isPublic: false }),
    });
    const json = await res.json();
    if (json.scene?.id) router.push(`/admin/scenes/${json.scene.id}`);
  }

  return (
    <>
      <Head>
        <title>{`Admin · ${scene.name || "Scene"}`}</title>
      </Head>
      <AdminLayout
        storeMode={storeMode}
        reserveFxGutter={fxOpen}
        constrainWidth={false}
      >
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <input
            value={scene.name}
            onChange={(e) => update("name", e.target.value)}
            className="text-xl font-semibold bg-transparent border-b border-gray-800 focus:border-gray-500 focus:outline-none px-1 py-1 min-w-[240px] flex-1"
            placeholder="Untitled scene"
          />
          <span className="text-xs mr-2">
            {saveError ? (
              <span className="text-red-400">{saveError}</span>
            ) : saving ? (
              <span className="text-gray-500">Saving…</span>
            ) : savedAt ? (
              <span className="text-gray-500">Saved {new Date(savedAt).toLocaleTimeString()}</span>
            ) : null}
          </span>
          <button
            onClick={() => setFxOpen((v) => !v)}
            className={`px-3 py-1.5 rounded text-xs uppercase tracking-widest border ${
              fxOpen
                ? "bg-amber-500 text-black border-amber-500"
                : "bg-gray-900 border-gray-700 hover:border-gray-500 text-gray-200"
            }`}
            title="Toggle FX panel"
          >
            FX
          </button>
          <a
            href={`/preview/${scene.id}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded text-xs uppercase tracking-widest bg-gray-900 border border-gray-700 hover:border-gray-500 text-gray-200"
            title="Open a fullscreen preview of just this scene"
          >
            ↗ Preview
          </a>
          <button
            onClick={duplicate}
            className="px-3 py-1.5 rounded text-xs uppercase tracking-widest bg-gray-900 border border-gray-700 hover:border-gray-500 text-gray-200"
          >
            Duplicate
          </button>
          <button
            onClick={remove}
            className="px-3 py-1.5 rounded text-xs uppercase tracking-widest bg-red-900/30 text-red-300 border border-red-900 hover:border-red-700"
          >
            Delete
          </button>
        </div>

        <div className="grid grid-cols-[280px_1fr] gap-6 items-start">
          {/* Left rail: scene metadata + video */}
          <div className="space-y-5">
            <Section title="Visibility">
              <Row label="Public">
                <Toggle checked={scene.isPublic} onChange={(v) => update("isPublic", v)} />
              </Row>
              <Row label="Sort">
                <input
                  type="number"
                  value={scene.sortOrder}
                  onChange={(e) => update("sortOrder", parseInt(e.target.value, 10) || 0)}
                  className="bg-gray-900 border border-gray-700 rounded px-2 py-1 w-16 text-sm"
                />
              </Row>
              <Row label="Theme">
                <select
                  value={scene.themeOverride ?? ""}
                  onChange={(e) =>
                    update("themeOverride", (e.target.value || null) as ThemeOverride)
                  }
                  className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm"
                >
                  <option value="">follow user</option>
                  <option value="light">force light</option>
                  <option value="dark">force dark</option>
                </select>
              </Row>
              <Row label="Blend">
                <select
                  value={scene.blendMode}
                  onChange={(e) => update("blendMode", e.target.value as BlendMode)}
                  className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm"
                  title="CSS blend mode used when this scene stacks on top of others (stack rotation mode)"
                >
                  {BLEND_MODES.map((bm) => (
                    <option key={bm} value={bm}>
                      {bm}
                    </option>
                  ))}
                </select>
              </Row>
            </Section>

            <Section title="Video">
              <StashUpload
                currentUrl={scene.videoUrl}
                onUploaded={(url) => update("videoUrl", url)}
                onClear={() => update("videoUrl", null)}
              />
              <Slider
                label="Opacity"
                min={0}
                max={1}
                step={0.05}
                value={scene.videoOpacity}
                onChange={(v) => update("videoOpacity", v)}
              />
              <Slider
                label="Blur"
                min={0}
                max={40}
                step={1}
                value={scene.videoBlur}
                onChange={(v) => update("videoBlur", v)}
              />
            </Section>
          </div>

          {/* Big live preview */}
          <div>
            <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">Live preview</div>
            <ScenePreview scene={scene} className="w-full aspect-video" />
            <div className="text-xs text-gray-500 mt-2 font-mono">
              mode: <span className="text-amber-400">{scene.fxMode}</span> · wet:{" "}
              {scene.fxWet.toFixed(2)} · {scene.videoUrl ? "video loaded" : "no video"}
            </div>
          </div>
        </div>
      </AdminLayout>

      {fxOpen && (
        <EffectsPanel
          mode={scene.fxMode}
          params={scene.fxParams}
          wet={scene.fxWet}
          hover={scene.hover}
          onModeChange={(m) => update("fxMode", m)}
          onParamChange={handleParamChange}
          onWetChange={(w) => update("fxWet", w)}
          onHoverChange={(h) => update("hover", h)}
          onReset={() => update("fxParams", defaultParams())}
          onClose={() => setFxOpen(false)}
        />
      )}
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
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
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
