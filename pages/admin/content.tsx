import Head from "next/head";
import { useEffect, useMemo, useRef, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { withAdminAuth } from "@/lib/admin/withAdminAuth";
import { translations } from "@/lib/translations";
import { listAllContent, LANGUAGES, type Language, type ContentEntry } from "@/lib/content/store";

interface Props {
  initialRows: ContentEntry[];
}

export const getServerSideProps = withAdminAuth<Props>(async () => {
  try {
    const initialRows = await listAllContent();
    return { props: { initialRows: JSON.parse(JSON.stringify(initialRows)) } };
  } catch (err) {
    console.error("[admin/content gsp]", err);
    return { props: { initialRows: [] } };
  }
});

/** Walk the static translations.EN tree and emit dotted keys with their default value. */
function discoverKeys(): Array<{ key: string; section: string; defaultEn: string }> {
  const out: Array<{ key: string; section: string; defaultEn: string }> = [];
  const en = (translations as Record<string, Record<string, unknown>>).EN;
  for (const section of Object.keys(en)) {
    const sub = en[section] as Record<string, unknown>;
    if (typeof sub !== "object" || sub === null) continue;
    for (const k of Object.keys(sub)) {
      const v = sub[k];
      if (typeof v === "string") {
        out.push({ key: `${section}.${k}`, section, defaultEn: v });
      }
    }
  }
  return out;
}

type OverrideMap = Record<string, Record<Language, string>>;

function rowsToMap(rows: ContentEntry[]): OverrideMap {
  const map: OverrideMap = {};
  for (const r of rows) {
    if (!map[r.key]) map[r.key] = {} as Record<Language, string>;
    map[r.key][r.language] = r.value;
  }
  return map;
}

export default function AdminContentPage({ initialRows }: Props) {
  const [overrides, setOverrides] = useState<OverrideMap>(() => rowsToMap(initialRows));
  const [lang, setLang] = useState<Language>("EN");
  const [filter, setFilter] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Record<string, number>>({});
  const debounce = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const keys = useMemo(() => discoverKeys(), []);
  const sections = useMemo(() => {
    const set = new Set(keys.map((k) => k.section));
    return Array.from(set);
  }, [keys]);

  const filteredKeys = useMemo(() => {
    if (!filter.trim()) return keys;
    const q = filter.toLowerCase();
    return keys.filter(
      (k) =>
        k.key.toLowerCase().includes(q) ||
        k.defaultEn.toLowerCase().includes(q) ||
        (overrides[k.key]?.[lang] ?? "").toLowerCase().includes(q)
    );
  }, [filter, keys, overrides, lang]);

  function valueFor(key: string): string {
    return overrides[key]?.[lang] ?? "";
  }

  function setValue(key: string, value: string) {
    setOverrides((m) => {
      const next = { ...m };
      next[key] = { ...(next[key] ?? ({} as Record<Language, string>)), [lang]: value };
      return next;
    });
    const debounceKey = `${key}:${lang}`;
    if (debounce.current[debounceKey]) clearTimeout(debounce.current[debounceKey]);
    debounce.current[debounceKey] = setTimeout(async () => {
      setSaving(debounceKey);
      try {
        await fetch("/api/admin/content", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ key, language: lang, value }),
        });
        setSavedAt((s) => ({ ...s, [debounceKey]: Date.now() }));
      } finally {
        setSaving(null);
      }
    }, 500);
  }

  async function resetKey(key: string) {
    await fetch("/api/admin/content", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key, language: lang }),
    });
    setOverrides((m) => {
      const next = { ...m };
      if (next[key]) {
        const langs = { ...next[key] };
        delete langs[lang];
        next[key] = langs;
      }
      return next;
    });
  }

  return (
    <>
      <Head>
        <title>Admin · Content</title>
      </Head>
      <AdminLayout>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Content</h1>
            <p className="text-sm text-gray-400 mt-1">
              Edit any text on the site. Overrides save live to Supabase + reflect on the public
              site within ~30 seconds (CDN cache). Empty = uses the EN default below.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 rounded text-xs uppercase tracking-widest border ${
                  lang === l
                    ? "bg-amber-500 text-black border-amber-500"
                    : "bg-gray-900 border-gray-700 hover:border-gray-500 text-gray-200"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="filter by key or text…"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm"
          />
        </div>

        {sections.map((sec) => {
          const rows = filteredKeys.filter((k) => k.section === sec);
          if (!rows.length) return null;
          return (
            <section key={sec} className="mb-8">
              <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-2">{sec}</h2>
              <div className="bg-gray-900 border border-gray-800 rounded-md divide-y divide-gray-800">
                {rows.map((r) => {
                  const dbKey = `${r.key}:${lang}`;
                  const value = valueFor(r.key);
                  const overridden = Boolean(overrides[r.key]?.[lang]);
                  return (
                    <div key={r.key} className="p-3 grid grid-cols-[200px_1fr_auto] gap-3 items-start">
                      <div className="font-mono text-xs text-gray-400 break-all">
                        {r.key}
                        <div className="text-[10px] text-gray-600 mt-1 line-clamp-2">{r.defaultEn}</div>
                      </div>
                      <textarea
                        value={value}
                        onChange={(e) => setValue(r.key, e.target.value)}
                        placeholder={lang === "EN" ? r.defaultEn : `(${lang} translation, defaults to EN)`}
                        rows={Math.min(4, Math.max(1, Math.ceil(value.length / 80)))}
                        className="bg-gray-950 border border-gray-700 rounded px-2 py-1.5 text-sm font-mono text-gray-100 resize-y min-h-[28px]"
                      />
                      <div className="flex flex-col items-end gap-1 min-w-[80px]">
                        <span className="text-[10px] text-gray-500">
                          {saving === dbKey
                            ? "saving…"
                            : savedAt[dbKey]
                              ? `saved ${new Date(savedAt[dbKey]).toLocaleTimeString()}`
                              : overridden
                                ? "custom"
                                : "default"}
                        </span>
                        {overridden && (
                          <button
                            onClick={() => resetKey(r.key)}
                            className="text-[10px] uppercase tracking-widest text-red-300 border border-red-900 hover:border-red-700 px-2 py-0.5 rounded"
                          >
                            reset
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </AdminLayout>
    </>
  );
}
