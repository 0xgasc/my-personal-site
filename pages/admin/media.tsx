import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import StashUpload from "@/components/admin/StashUpload";
import { withAdminAuth } from "@/lib/admin/withAdminAuth";
import { listAllMedia, type MediaEntry } from "@/lib/cms/store";

interface Props {
  initialRows: MediaEntry[];
}

export const getServerSideProps = withAdminAuth<Props>(async () => {
  try {
    const initialRows = await listAllMedia();
    return { props: { initialRows: JSON.parse(JSON.stringify(initialRows)) } };
  } catch {
    return { props: { initialRows: [] } };
  }
});

export default function AdminMediaPage({ initialRows }: Props) {
  const [rows, setRows] = useState<MediaEntry[]>(initialRows);
  const [newKey, setNewKey] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newAlt, setNewAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const debounce = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  async function refresh() {
    const r = await fetch("/api/admin/media");
    const j = await r.json();
    setRows(j.rows ?? []);
  }

  async function add() {
    if (!newKey || !newUrl) return;
    setBusy(true);
    try {
      await fetch("/api/admin/media", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key: newKey, url: newUrl, alt: newAlt }),
      });
      setNewKey("");
      setNewUrl("");
      setNewAlt("");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  function updateField(key: string, field: "url" | "alt", value: string) {
    setRows((r) =>
      r.map((row) => (row.key === key ? { ...row, [field]: value } : row))
    );
    const debounceKey = `${key}:${field}`;
    if (debounce.current[debounceKey]) clearTimeout(debounce.current[debounceKey]);
    debounce.current[debounceKey] = setTimeout(async () => {
      const row = rows.find((r) => r.key === key);
      const merged = { ...row, [field]: value } as MediaEntry;
      await fetch("/api/admin/media", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key, url: merged.url, alt: merged.alt }),
      });
    }, 500);
  }

  async function remove(key: string) {
    if (!confirm(`Delete media key "${key}"?`)) return;
    await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key }),
    });
    await refresh();
  }

  return (
    <>
      <Head>
        <title>Admin · Media</title>
      </Head>
      <AdminLayout>
        <h1 className="text-2xl font-semibold mb-2">Media library</h1>
        <p className="text-sm text-gray-400 mb-6">
          Each row is a named slot. Components that reference a key (e.g.{" "}
          <code className="font-mono text-amber-400">home.arttabIframe</code>) read the URL
          from here. Upload via Stash → paste the Irys URL → assign a key.
        </p>

        <section className="bg-gray-900 border border-gray-800 rounded-md p-4 mb-6 space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-gray-500">Quick upload</h2>
          <StashUpload
            currentUrl={null}
            onUploaded={(url) => setNewUrl(url)}
            onClear={() => setNewUrl("")}
          />
          <div className="grid grid-cols-[180px_1fr_160px_auto] gap-2">
            <input
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="key (e.g. home.cover)"
              className="bg-gray-950 border border-gray-700 rounded px-2 py-1 text-sm font-mono"
            />
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="url (Irys / Arweave / any)"
              className="bg-gray-950 border border-gray-700 rounded px-2 py-1 text-sm font-mono"
            />
            <input
              value={newAlt}
              onChange={(e) => setNewAlt(e.target.value)}
              placeholder="alt text"
              className="bg-gray-950 border border-gray-700 rounded px-2 py-1 text-sm"
            />
            <button
              onClick={add}
              disabled={!newKey || !newUrl || busy}
              className="px-3 py-1 rounded bg-amber-500 text-black font-medium disabled:opacity-50"
            >
              + add
            </button>
          </div>
        </section>

        {rows.length === 0 ? (
          <p className="text-gray-500 text-sm">No media yet — add the first row above.</p>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-md divide-y divide-gray-800">
            {rows.map((r) => (
              <div key={r.key} className="p-3 grid grid-cols-[180px_1fr_160px_auto] gap-2 items-center">
                <span className="font-mono text-xs text-amber-400 break-all">{r.key}</span>
                <input
                  value={r.url}
                  onChange={(e) => updateField(r.key, "url", e.target.value)}
                  className="bg-gray-950 border border-gray-700 rounded px-2 py-1 text-xs font-mono"
                />
                <input
                  value={r.alt}
                  onChange={(e) => updateField(r.key, "alt", e.target.value)}
                  placeholder="alt"
                  className="bg-gray-950 border border-gray-700 rounded px-2 py-1 text-xs"
                />
                <button
                  onClick={() => remove(r.key)}
                  className="text-[10px] uppercase tracking-widest text-red-300 border border-red-900 hover:border-red-700 px-2 py-1 rounded"
                >
                  del
                </button>
              </div>
            ))}
          </div>
        )}
      </AdminLayout>
    </>
  );
}
