import Head from "next/head";
import { useMemo, useRef, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { withAdminAuth } from "@/lib/admin/withAdminAuth";
import { listAllSections, listAllPages, type Section, type SectionType, type PageRow } from "@/lib/cms/store";

const SECTION_TYPES: SectionType[] = [
  "heading",
  "paragraph",
  "image",
  "link",
  "divider",
  "embed",
  "gallery",
  "raw_html",
];

const BUILTIN_PAGES = ["home", "career", "collection", "experiments", "tip"];

interface Props {
  initialSections: Section[];
  initialPages: PageRow[];
}

export const getServerSideProps = withAdminAuth<Props>(async () => {
  try {
    const [initialSections, initialPages] = await Promise.all([
      listAllSections(),
      listAllPages(),
    ]);
    return {
      props: {
        initialSections: JSON.parse(JSON.stringify(initialSections)),
        initialPages: JSON.parse(JSON.stringify(initialPages)),
      },
    };
  } catch {
    return { props: { initialSections: [], initialPages: [] } };
  }
});

export default function AdminSectionsPage({ initialSections, initialPages }: Props) {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [page, setPage] = useState<string>("home");
  const [newType, setNewType] = useState<SectionType>("paragraph");
  const debounce = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const allPages = useMemo(() => {
    const fromDb = initialPages.map((p) => p.slug);
    return Array.from(new Set([...BUILTIN_PAGES, ...fromDb]));
  }, [initialPages]);

  const pageSections = sections
    .filter((s) => s.page === page)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  async function refresh() {
    const r = await fetch("/api/admin/sections");
    const j = await r.json();
    setSections(j.sections ?? []);
  }

  async function addSection() {
    const sortOrder = (pageSections[pageSections.length - 1]?.sortOrder ?? 0) + 10;
    await fetch("/api/admin/sections", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        page,
        type: newType,
        sortOrder,
        isPublic: true,
        data: defaultDataFor(newType),
      }),
    });
    await refresh();
  }

  function patch(id: string, patch: Partial<Section>) {
    setSections((s) => s.map((row) => (row.id === id ? { ...row, ...patch } : row)));
    const k = `${id}:${Object.keys(patch).join(",")}`;
    if (debounce.current[k]) clearTimeout(debounce.current[k]);
    debounce.current[k] = setTimeout(async () => {
      await fetch(`/api/admin/sections/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      });
    }, 400);
  }

  async function remove(id: string) {
    if (!confirm("Delete this section?")) return;
    await fetch(`/api/admin/sections/${id}`, { method: "DELETE" });
    await refresh();
  }

  async function move(id: string, dir: -1 | 1) {
    const i = pageSections.findIndex((s) => s.id === id);
    const swap = pageSections[i + dir];
    if (!swap) return;
    await Promise.all([
      patch(id, { sortOrder: swap.sortOrder }),
      patch(swap.id, { sortOrder: pageSections[i].sortOrder }),
    ]);
  }

  return (
    <>
      <Head>
        <title>Admin · Sections</title>
      </Head>
      <AdminLayout>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Sections</h1>
            <p className="text-sm text-gray-400 mt-1">
              Add custom sections below the hardcoded content on any page.
              They render in <code className="font-mono text-amber-400">SectionsRenderer</code>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={page}
              onChange={(e) => setPage(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-sm"
            >
              {allPages.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded p-3 flex items-center gap-2 mb-6">
          <span className="text-xs uppercase tracking-widest text-gray-500">+ add</span>
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as SectionType)}
            className="bg-gray-950 border border-gray-700 rounded px-2 py-1 text-sm"
          >
            {SECTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button
            onClick={addSection}
            className="ml-auto px-3 py-1 rounded bg-amber-500 text-black text-xs uppercase tracking-widest font-medium"
          >
            insert
          </button>
        </div>

        {pageSections.length === 0 ? (
          <p className="text-sm text-gray-500">
            No sections on this page. Use “+ add” to insert one.
          </p>
        ) : (
          <ul className="space-y-3">
            {pageSections.map((s, i) => (
              <li key={s.id} className="bg-gray-900 border border-gray-800 rounded-md p-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex flex-col">
                    <button
                      onClick={() => move(s.id, -1)}
                      disabled={i === 0}
                      className="text-xs text-gray-500 hover:text-white disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => move(s.id, 1)}
                      disabled={i === pageSections.length - 1}
                      className="text-xs text-gray-500 hover:text-white disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>
                  <span className="text-xs uppercase tracking-widest text-amber-400">{s.type}</span>
                  <label className="ml-auto flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={s.isPublic}
                      onChange={(e) => patch(s.id, { isPublic: e.target.checked })}
                    />
                    <span className="text-gray-400">public</span>
                  </label>
                  <button
                    onClick={() => remove(s.id)}
                    className="text-[10px] uppercase tracking-widest text-red-300 border border-red-900 hover:border-red-700 px-2 py-1 rounded"
                  >
                    del
                  </button>
                </div>
                <DataEditor section={s} onChange={(data) => patch(s.id, { data })} />
              </li>
            ))}
          </ul>
        )}
      </AdminLayout>
    </>
  );
}

function defaultDataFor(t: SectionType): Record<string, unknown> {
  switch (t) {
    case "heading":
      return { text: "New heading", level: 2 };
    case "paragraph":
      return { text: "" };
    case "image":
      return { src: "", alt: "" };
    case "link":
      return { href: "https://", label: "label" };
    case "divider":
      return {};
    case "embed":
      return { src: "https://", title: "embed", height: 480 };
    case "gallery":
      return { items: [] };
    case "raw_html":
      return { html: "<div>raw html</div>" };
  }
}

function DataEditor({
  section,
  onChange,
}: {
  section: Section;
  onChange: (data: Record<string, unknown>) => void;
}) {
  const d = section.data ?? {};
  const set = (patch: Record<string, unknown>) => onChange({ ...d, ...patch });
  const text = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);
  const num = (v: unknown, fallback = 0) => (typeof v === "number" ? v : fallback);
  const inputClass = "w-full bg-gray-950 border border-gray-700 rounded px-2 py-1 text-sm font-mono";

  switch (section.type) {
    case "heading":
      return (
        <div className="space-y-2">
          <input
            value={text(d.text)}
            placeholder="heading text"
            onChange={(e) => set({ text: e.target.value })}
            className={inputClass}
          />
          <select
            value={num(d.level, 2)}
            onChange={(e) => set({ level: parseInt(e.target.value, 10) })}
            className={inputClass}
          >
            <option value={1}>h1</option>
            <option value={2}>h2</option>
            <option value={3}>h3</option>
          </select>
        </div>
      );
    case "paragraph":
      return (
        <textarea
          value={text(d.text)}
          rows={4}
          onChange={(e) => set({ text: e.target.value })}
          className={inputClass + " resize-y"}
          placeholder="paragraph text…"
        />
      );
    case "image":
      return (
        <div className="space-y-2">
          <input value={text(d.src)} placeholder="image url" onChange={(e) => set({ src: e.target.value })} className={inputClass} />
          <input value={text(d.alt)} placeholder="alt" onChange={(e) => set({ alt: e.target.value })} className={inputClass} />
        </div>
      );
    case "link":
      return (
        <div className="space-y-2">
          <input value={text(d.label)} placeholder="link label" onChange={(e) => set({ label: e.target.value })} className={inputClass} />
          <input value={text(d.href)} placeholder="href" onChange={(e) => set({ href: e.target.value })} className={inputClass} />
        </div>
      );
    case "divider":
      return <p className="text-xs text-gray-500">divider — no params</p>;
    case "embed":
      return (
        <div className="space-y-2">
          <input value={text(d.src)} placeholder="iframe src" onChange={(e) => set({ src: e.target.value })} className={inputClass} />
          <input value={text(d.title, "embed")} placeholder="title" onChange={(e) => set({ title: e.target.value })} className={inputClass} />
          <input
            type="number"
            value={num(d.height, 480)}
            onChange={(e) => set({ height: parseInt(e.target.value, 10) || 480 })}
            className={inputClass}
          />
        </div>
      );
    case "gallery": {
      const items = Array.isArray(d.items) ? (d.items as Array<Record<string, unknown>>) : [];
      const updateItem = (i: number, patch: Record<string, unknown>) => {
        const next = items.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
        set({ items: next });
      };
      return (
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input
                value={text(it.src)}
                placeholder="src"
                onChange={(e) => updateItem(i, { src: e.target.value })}
                className={inputClass}
              />
              <input
                value={text(it.alt)}
                placeholder="alt"
                onChange={(e) => updateItem(i, { alt: e.target.value })}
                className={inputClass}
              />
              <button
                onClick={() => set({ items: items.filter((_, idx) => idx !== i) })}
                className="text-[10px] uppercase tracking-widest text-red-300 border border-red-900 hover:border-red-700 px-2 py-1 rounded"
              >
                del
              </button>
            </div>
          ))}
          <button
            onClick={() => set({ items: [...items, { src: "", alt: "" }] })}
            className="text-[10px] uppercase tracking-widest text-amber-400 border border-amber-700 hover:border-amber-500 px-2 py-1 rounded"
          >
            + add image
          </button>
        </div>
      );
    }
    case "raw_html":
      return (
        <textarea
          value={text(d.html)}
          rows={5}
          onChange={(e) => set({ html: e.target.value })}
          className={inputClass + " resize-y"}
          placeholder="<div>…</div>"
        />
      );
  }
}
