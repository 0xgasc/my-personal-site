import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { withAdminAuth } from "@/lib/admin/withAdminAuth";
import { listAllItems, type PortfolioItem, type PortfolioType } from "@/lib/portfolio/store";

interface Props {
  initialItems: PortfolioItem[];
}

export const getServerSideProps = withAdminAuth<Props>(async () => {
  try {
    const initialItems = await listAllItems();
    return { props: { initialItems: JSON.parse(JSON.stringify(initialItems)) } };
  } catch (err) {
    console.error("[admin/portfolio gsp]", err);
    return { props: { initialItems: [] } };
  }
});

const TABS: { key: PortfolioType; label: string; hint: string }[] = [
  { key: "project",       label: "Selected Works",  hint: "title, description, image URL, project link" },
  { key: "stretch_study", label: "Stretch Studies",  hint: "title, image URL, optional mint link" },
  { key: "music",         label: "Music",            hint: "title, description, embed URL (src) or direct link" },
];

const EMPTY: Omit<PortfolioItem, "id" | "createdAt"> = {
  type: "project",
  title: "",
  description: "",
  src: "",
  link: "",
  sortOrder: 0,
  published: true,
};

export default function AdminPortfolioPage({ initialItems }: Props) {
  const [items, setItems] = useState<PortfolioItem[]>(initialItems);
  const [tab, setTab] = useState<PortfolioType>("project");
  const [editing, setEditing] = useState<PortfolioItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<PortfolioItem, "id" | "createdAt">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const tabItems = items.filter((i) => i.type === tab);
  const tabMeta = TABS.find((t) => t.key === tab)!;

  function startCreate() {
    setForm({ ...EMPTY, type: tab, sortOrder: tabItems.length });
    setEditing(null);
    setCreating(true);
    setError("");
  }

  function startEdit(item: PortfolioItem) {
    setForm({
      type: item.type,
      title: item.title,
      description: item.description,
      src: item.src,
      link: item.link,
      sortOrder: item.sortOrder,
      published: item.published,
    });
    setEditing(item);
    setCreating(false);
    setError("");
  }

  function cancelForm() {
    setEditing(null);
    setCreating(false);
    setError("");
  }

  async function saveForm() {
    setSaving(true);
    setError("");
    try {
      if (creating) {
        const res = await fetch("/api/admin/portfolio", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error(await res.text());
        const { item } = await res.json();
        setItems((prev) => [...prev, item]);
      } else if (editing) {
        const res = await fetch(`/api/admin/portfolio/${editing.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error(await res.text());
        const { item } = await res.json();
        setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
      }
      setEditing(null);
      setCreating(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(item: PortfolioItem) {
    if (!confirm(`Delete "${item.title || "this item"}"?`)) return;
    await fetch(`/api/admin/portfolio/${item.id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  }

  async function togglePublished(item: PortfolioItem) {
    const res = await fetch(`/api/admin/portfolio/${item.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ published: !item.published }),
    });
    if (res.ok) {
      const { item: updated } = await res.json();
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    }
  }

  const showSrc =
    tab === "project" || tab === "stretch_study" || tab === "music";
  const srcLabel =
    tab === "music" ? "Embed URL (SoundCloud / Spotify / etc.)" : "Image URL";

  return (
    <>
      <Head>
        <title>Admin · Portfolio</title>
      </Head>
      <AdminLayout>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Portfolio</h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage selected works, stretch studies, and music shown on the Experiments page.
            </p>
          </div>
          <button
            onClick={startCreate}
            className="px-4 py-2 bg-amber-500 text-black rounded text-sm font-medium hover:bg-amber-400"
          >
            + Add {tabMeta.label.slice(0, -1)}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-800">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); cancelForm(); }}
              className={`px-4 py-2 rounded-t-md text-sm ${
                tab === t.key
                  ? "bg-gray-900 text-white border-b-2 border-amber-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {t.label}
              <span className="ml-2 text-xs text-gray-500">
                {items.filter((i) => i.type === t.key).length}
              </span>
            </button>
          ))}
        </div>

        {/* Form */}
        {(creating || editing) && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6 space-y-3">
            <h2 className="text-sm font-semibold text-gray-200">
              {creating ? `New ${tabMeta.label.slice(0, -1)}` : `Edit: ${editing!.title || "item"}`}
            </h2>
            <p className="text-xs text-gray-500">{tabMeta.hint}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  placeholder="Title"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Link (external URL)</label>
                <input
                  value={form.link}
                  onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  placeholder="https://..."
                />
              </div>
            </div>

            {showSrc && (
              <div>
                <label className="block text-xs text-gray-400 mb-1">{srcLabel}</label>
                <input
                  value={form.src}
                  onChange={(e) => setForm((f) => ({ ...f, src: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  placeholder="https://..."
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-400 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
                placeholder="Short description..."
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400">Sort order</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                  className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                  className="rounded"
                />
                Published
              </label>
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <div className="flex gap-2 pt-1">
              <button
                onClick={saveForm}
                disabled={saving}
                className="px-4 py-2 bg-amber-500 text-black rounded text-sm font-medium hover:bg-amber-400 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={cancelForm}
                className="px-4 py-2 bg-gray-700 text-gray-200 rounded text-sm hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Items list */}
        {tabItems.length === 0 ? (
          <p className="text-gray-500 text-sm">No {tabMeta.label.toLowerCase()} yet. Add one above.</p>
        ) : (
          <div className="space-y-2">
            {tabItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-4 bg-gray-900 border border-gray-800 rounded-xl"
              >
                {item.src && tab !== "music" && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-14 h-14 object-cover rounded-lg shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-white truncate">
                      {item.title || "(untitled)"}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        item.published
                          ? "bg-green-900 text-green-300"
                          : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {item.published ? "live" : "draft"}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{item.description}</p>
                  )}
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-amber-500 hover:underline truncate block"
                    >
                      {item.link}
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => togglePublished(item)}
                    className="px-2 py-1 rounded text-xs bg-gray-800 hover:bg-gray-700 text-gray-300"
                    title={item.published ? "Unpublish" : "Publish"}
                  >
                    {item.published ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => startEdit(item)}
                    className="px-2 py-1 rounded text-xs bg-gray-800 hover:bg-gray-700 text-gray-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteItem(item)}
                    className="px-2 py-1 rounded text-xs bg-gray-800 hover:bg-red-900 text-gray-300 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link href="/admin" className="text-xs text-gray-500 hover:text-gray-300">
            ← Back to admin
          </Link>
        </div>
      </AdminLayout>
    </>
  );
}
