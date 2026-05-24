import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { withAdminAuth } from "@/lib/admin/withAdminAuth";
import { listAllPages, type PageRow } from "@/lib/cms/store";

interface Props {
  initialPages: PageRow[];
}

export const getServerSideProps = withAdminAuth<Props>(async () => {
  try {
    const initialPages = await listAllPages();
    return { props: { initialPages: JSON.parse(JSON.stringify(initialPages)) } };
  } catch {
    return { props: { initialPages: [] } };
  }
});

export default function AdminPagesPage({ initialPages }: Props) {
  const [pages, setPages] = useState<PageRow[]>(initialPages);
  const [newSlug, setNewSlug] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const r = await fetch("/api/admin/pages");
    const j = await r.json();
    setPages(j.pages ?? []);
  }

  async function create() {
    if (!newSlug) return;
    setBusy(true);
    try {
      await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: newSlug, title: newTitle || newSlug, isPublic: true }),
      });
      setNewSlug("");
      setNewTitle("");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function patch(slug: string, patch: Partial<PageRow>) {
    setPages((p) => p.map((row) => (row.slug === slug ? { ...row, ...patch } : row)));
    await fetch("/api/admin/pages", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, ...patch }),
    });
  }

  async function remove(slug: string) {
    if (!confirm(`Delete page "${slug}"? Sections on this page stay in the table but become orphaned.`)) return;
    await fetch("/api/admin/pages", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    await refresh();
  }

  return (
    <>
      <Head>
        <title>Admin · Pages</title>
      </Head>
      <AdminLayout>
        <h1 className="text-2xl font-semibold mb-2">Custom pages</h1>
        <p className="text-sm text-gray-400 mb-6">
          Spin up a new URL with a custom slug. Add sections to it via{" "}
          <Link href="/admin/sections" className="text-amber-400 underline">/admin/sections</Link>{" "}
          → pick this slug from the dropdown. Visit{" "}
          <code className="font-mono text-amber-400">/&lt;slug&gt;</code> to view.
        </p>

        <section className="bg-gray-900 border border-gray-800 rounded p-3 mb-6 grid grid-cols-[180px_1fr_auto] gap-2">
          <input
            value={newSlug}
            onChange={(e) =>
              setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
            }
            placeholder="slug (lowercase + hyphens)"
            className="bg-gray-950 border border-gray-700 rounded px-2 py-1 text-sm font-mono"
          />
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="title (optional)"
            className="bg-gray-950 border border-gray-700 rounded px-2 py-1 text-sm"
          />
          <button
            onClick={create}
            disabled={!newSlug || busy}
            className="px-3 py-1 rounded bg-amber-500 text-black text-xs uppercase tracking-widest font-medium disabled:opacity-50"
          >
            create
          </button>
        </section>

        {pages.length === 0 ? (
          <p className="text-sm text-gray-500">No custom pages yet.</p>
        ) : (
          <ul className="space-y-2">
            {pages.map((p) => (
              <li
                key={p.slug}
                className="bg-gray-900 border border-gray-800 rounded p-3 flex items-center gap-3"
              >
                <Link href={`/${p.slug}`} className="font-mono text-sm text-amber-400 underline">
                  /{p.slug}
                </Link>
                <input
                  value={p.title}
                  onChange={(e) => patch(p.slug, { title: e.target.value })}
                  className="flex-1 bg-gray-950 border border-gray-700 rounded px-2 py-1 text-sm"
                />
                <label className="text-xs flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={p.isPublic}
                    onChange={(e) => patch(p.slug, { isPublic: e.target.checked })}
                  />
                  <span className="text-gray-400">public</span>
                </label>
                <Link
                  href={`/admin/sections?page=${p.slug}`}
                  className="text-[10px] uppercase tracking-widest text-amber-400 border border-amber-700 hover:border-amber-500 px-2 py-1 rounded"
                >
                  sections
                </Link>
                <button
                  onClick={() => remove(p.slug)}
                  className="text-[10px] uppercase tracking-widest text-red-300 border border-red-900 hover:border-red-700 px-2 py-1 rounded"
                >
                  del
                </button>
              </li>
            ))}
          </ul>
        )}
      </AdminLayout>
    </>
  );
}
