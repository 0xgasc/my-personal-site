import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/admin/AdminLayout";
import PublishButton from "@/components/admin/PublishButton";
import { withAdminAuth } from "@/lib/admin/withAdminAuth";
import { getStore, getStoreMode } from "@/lib/store";
import type { Scene } from "@/lib/types";

interface PageProps {
  initialScenes: Scene[];
  storeMode: "local" | "remote";
}

export const getServerSideProps = withAdminAuth<PageProps>(async () => {
  const store = getStore();
  const initialScenes = await store.listAll();
  return {
    props: {
      initialScenes: JSON.parse(JSON.stringify(initialScenes)),
      storeMode: getStoreMode(),
    },
  };
});

export default function AdminScenesPage({ initialScenes, storeMode }: PageProps) {
  const [scenes, setScenes] = useState<Scene[]>(initialScenes);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  async function refresh() {
    const res = await fetch("/api/admin/scenes");
    const json = await res.json();
    setScenes(json.scenes ?? []);
  }

  async function createScene() {
    setCreating(true);
    try {
      const res = await fetch("/api/admin/scenes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "New scene",
          sortOrder: scenes.length,
        }),
      });
      const json = await res.json();
      if (json.scene?.id) {
        router.push(`/admin/scenes/${json.scene.id}`);
      }
    } finally {
      setCreating(false);
    }
  }

  async function togglePublic(scene: Scene) {
    await fetch(`/api/admin/scenes/${scene.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isPublic: !scene.isPublic }),
    });
    await refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this scene? This cannot be undone.")) return;
    await fetch(`/api/admin/scenes/${id}`, { method: "DELETE" });
    await refresh();
  }

  async function move(scene: Scene, direction: -1 | 1) {
    const idx = scenes.findIndex((s) => s.id === scene.id);
    const swapWith = scenes[idx + direction];
    if (!swapWith) return;
    await Promise.all([
      fetch(`/api/admin/scenes/${scene.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sortOrder: swapWith.sortOrder }),
      }),
      fetch(`/api/admin/scenes/${swapWith.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sortOrder: scene.sortOrder }),
      }),
    ]);
    await refresh();
  }

  return (
    <>
      <Head>
        <title>Admin · Scenes</title>
      </Head>
      <AdminLayout storeMode={storeMode}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Scenes</h1>
          <div className="flex items-center gap-3">
            {storeMode === "local" && <PublishButton />}
            <button
              onClick={createScene}
              disabled={creating}
              className="px-4 py-2 rounded-md bg-white text-gray-900 font-medium disabled:opacity-50"
            >
              {creating ? "Creating…" : "+ New scene"}
            </button>
          </div>
        </div>
        {scenes.length === 0 ? (
          <p className="text-gray-400">No scenes yet. Create your first scene to get started.</p>
        ) : (
          <ul className="space-y-2">
            {scenes.map((s, i) => (
              <li
                key={s.id}
                className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-md px-4 py-3"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <button
                      onClick={() => move(s, -1)}
                      disabled={i === 0}
                      className="text-xs text-gray-500 hover:text-white disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => move(s, 1)}
                      disabled={i === scenes.length - 1}
                      className="text-xs text-gray-500 hover:text-white disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>
                  <div>
                    <Link href={`/admin/scenes/${s.id}`} className="font-medium hover:underline">
                      {s.name || "Untitled"}
                    </Link>
                    <div className="text-xs text-gray-500 font-mono">
                      mode: {s.fxMode} · wet: {s.fxWet.toFixed(2)} · video:{" "}
                      {s.videoUrl ? "yes" : "—"} · theme: {s.themeOverride ?? "auto"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => togglePublic(s)}
                    className={`px-2 py-1 rounded text-xs ${
                      s.isPublic
                        ? "bg-green-600/20 text-green-300 border border-green-700"
                        : "bg-gray-800 text-gray-400 border border-gray-700"
                    }`}
                  >
                    {s.isPublic ? "public" : "private"}
                  </button>
                  <Link
                    href={`/admin/scenes/${s.id}`}
                    className="px-2 py-1 rounded text-xs bg-gray-800 border border-gray-700 hover:border-gray-500"
                  >
                    edit
                  </Link>
                  <button
                    onClick={() => remove(s.id)}
                    className="px-2 py-1 rounded text-xs bg-red-900/30 text-red-300 border border-red-900 hover:border-red-700"
                  >
                    delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminLayout>
    </>
  );
}
