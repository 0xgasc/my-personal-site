import Head from "next/head";
import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { withAdminAuth } from "@/lib/admin/withAdminAuth";
import { getStore, getStoreMode } from "@/lib/store";
import type { SiteSettings } from "@/lib/types";

interface PageProps {
  initialSettings: SiteSettings;
  storeMode: "local" | "remote";
}

export const getServerSideProps = withAdminAuth<PageProps>(async () => {
  const store = getStore();
  const settings = await store.getSettings();
  return {
    props: {
      initialSettings: JSON.parse(JSON.stringify(settings)),
      storeMode: getStoreMode(),
    },
  };
});

export default function AdminSettingsPage({ initialSettings, storeMode }: PageProps) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function patch(update: Partial<SiteSettings>) {
    const next = { ...settings, ...update };
    setSettings(next);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(update),
      });
      if (res.ok) {
        const json = await res.json();
        setSettings(json.settings);
        setSavedAt(Date.now());
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Head>
        <title>Admin · Settings</title>
      </Head>
      <AdminLayout storeMode={storeMode}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Master settings</h1>
          <span className="text-sm text-gray-500">
            {saving ? "Saving…" : savedAt ? `Saved ${new Date(savedAt).toLocaleTimeString()}` : ""}
          </span>
        </div>

        <div className="space-y-6 max-w-xl">
          <Row label="Background FX" hint="Master kill switch for all scenes site-wide.">
            <Toggle
              checked={settings.masterFxEnabled}
              onChange={(v) => patch({ masterFxEnabled: v })}
            />
          </Row>

          <Row label="Default theme" hint="Initial day/night mode for new visitors.">
            <select
              value={settings.defaultTheme}
              onChange={(e) => patch({ defaultTheme: e.target.value as SiteSettings["defaultTheme"] })}
              className="bg-gray-900 border border-gray-700 rounded px-3 py-1.5"
            >
              <option value="auto">auto</option>
              <option value="light">light</option>
              <option value="dark">dark</option>
            </select>
          </Row>

          <Row label="Rotation mode" hint="How public scenes are picked or composed.">
            <select
              value={settings.rotationMode}
              onChange={(e) => patch({ rotationMode: e.target.value as SiteSettings["rotationMode"] })}
              className="bg-gray-900 border border-gray-700 rounded px-3 py-1.5"
            >
              <option value="single">single (first public scene)</option>
              <option value="sequential">sequential (cycle)</option>
              <option value="random">random (cycle)</option>
              <option value="stack">stack (layer all simultaneously)</option>
            </select>
          </Row>

          {settings.rotationMode !== "single" && settings.rotationMode !== "stack" && (
            <Row label="Rotation interval (sec)" hint="How long each scene plays before switching.">
              <input
                type="number"
                min={3}
                max={3600}
                value={settings.rotationIntervalSec}
                onChange={(e) =>
                  patch({ rotationIntervalSec: Math.max(3, parseInt(e.target.value, 10) || 3) })
                }
                className="bg-gray-900 border border-gray-700 rounded px-3 py-1.5 w-24"
              />
            </Row>
          )}
        </div>
      </AdminLayout>
    </>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-900 pb-4">
      <div>
        <div className="font-medium">{label}</div>
        {hint && <div className="text-sm text-gray-500 mt-0.5">{hint}</div>}
      </div>
      <div>{children}</div>
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
