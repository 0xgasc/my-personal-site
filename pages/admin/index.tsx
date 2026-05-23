import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { withAdminAuth } from "@/lib/admin/withAdminAuth";
import { listAllClips } from "@/lib/clips/store";
import type { Clip } from "@/lib/clips/types";

interface Props {
  initialClips: Clip[];
}

export const getServerSideProps = withAdminAuth<Props>(async () => {
  try {
    const initialClips = await listAllClips();
    return { props: { initialClips: JSON.parse(JSON.stringify(initialClips)) } };
  } catch (err) {
    console.error("[admin index]", err);
    return { props: { initialClips: [] } };
  }
});

export default function AdminClipsPage({ initialClips }: Props) {
  const [clips, setClips] = useState<Clip[]>(initialClips);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const res = await fetch("/api/admin/clips");
    const json = await res.json();
    setClips(json.clips ?? []);
  }

  async function togglePublic(c: Clip) {
    setBusy(true);
    try {
      await fetch(`/api/admin/clips/${c.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isPublic: !c.isPublic }),
      });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function move(c: Clip, dir: -1 | 1) {
    const i = clips.findIndex((x) => x.id === c.id);
    const swap = clips[i + dir];
    if (!swap) return;
    setBusy(true);
    try {
      await Promise.all([
        fetch(`/api/admin/clips/${c.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sortOrder: swap.sortOrder }),
        }),
        fetch(`/api/admin/clips/${swap.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sortOrder: c.sortOrder }),
        }),
      ]);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this clip?")) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/clips/${id}`, { method: "DELETE" });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Head>
        <title>Admin · Clips</title>
      </Head>
      <AdminLayout>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Background clips</h1>
          <Link
            href="/admin/upload"
            className="px-4 py-2 rounded-md bg-white text-gray-900 font-medium"
          >
            + Add clip
          </Link>
        </div>
        {clips.length === 0 ? (
          <div className="text-gray-400 max-w-xl">
            <p>No clips yet.</p>
            <p className="mt-3 text-sm">
              Hit <Link href="/admin/upload" className="text-amber-400 underline">+ Add clip</Link> to
              upload a video via Stash. The Irys URL auto-fills a new clip row you can then tune.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {clips.map((c, i) => (
              <li
                key={c.id}
                className="bg-gray-900 border border-gray-800 rounded-md px-4 py-3 flex items-center gap-4"
              >
                <div className="flex flex-col">
                  <button
                    onClick={() => move(c, -1)}
                    disabled={busy || i === 0}
                    className="text-xs text-gray-500 hover:text-white disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => move(c, 1)}
                    disabled={busy || i === clips.length - 1}
                    className="text-xs text-gray-500 hover:text-white disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/admin/clips/${c.id}`} className="font-medium hover:underline">
                    {c.name || "untitled"}
                  </Link>
                  <div className="text-xs text-gray-500 font-mono truncate">
                    dither {c.fxDitherIntensity.toFixed(2)} · {c.fxPalette} · {c.fxBlendMode} ·{" "}
                    start: {c.startMode} · {c.orientation} · {c.mobileZoom}
                  </div>
                  <div className="text-[10px] text-gray-600 font-mono truncate mt-0.5">
                    {c.videoUrl}
                  </div>
                </div>
                <button
                  onClick={() => togglePublic(c)}
                  disabled={busy}
                  className={`px-2 py-1 rounded text-xs ${
                    c.isPublic
                      ? "bg-green-600/20 text-green-300 border border-green-700"
                      : "bg-gray-800 text-gray-400 border border-gray-700"
                  }`}
                >
                  {c.isPublic ? "public" : "private"}
                </button>
                <Link
                  href={`/admin/clips/${c.id}`}
                  className="px-2 py-1 rounded text-xs bg-gray-800 border border-gray-700 hover:border-gray-500"
                >
                  edit
                </Link>
                <button
                  onClick={() => remove(c.id)}
                  disabled={busy}
                  className="px-2 py-1 rounded text-xs bg-red-900/30 text-red-300 border border-red-900 hover:border-red-700"
                >
                  delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </AdminLayout>
    </>
  );
}
