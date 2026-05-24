import Head from "next/head";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
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

interface KeyMeta {
  key: string;
  section: string;
  subkey: string;
  label: string;
  defaultEn: string;
  multiline: boolean;
}

/** Friendly camelCase / dot.case → "Title Case" */
function prettyLabel(s: string): string {
  return s
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_.-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function discoverKeys(): KeyMeta[] {
  const out: KeyMeta[] = [];
  const en = (translations as Record<string, Record<string, unknown>>).EN;
  for (const section of Object.keys(en)) {
    const sub = en[section] as Record<string, unknown>;
    if (typeof sub !== "object" || sub === null) continue;
    for (const k of Object.keys(sub)) {
      const v = sub[k];
      if (typeof v === "string") {
        out.push({
          key: `${section}.${k}`,
          section,
          subkey: k,
          label: prettyLabel(k),
          defaultEn: v,
          multiline: v.length > 80 || /[.!?]\s/.test(v),
        });
      }
    }
  }
  return out;
}

// Friendly section labels + preview URLs (where applicable).
const SECTION_META: Record<string, { label: string; href?: string }> = {
  home: { label: "Home", href: "/" },
  career: { label: "Career", href: "/career" },
  experiments: { label: "Experiments", href: "/experiments" },
  collection: { label: "Collection", href: "/collection" },
  tip: { label: "Tip", href: "/tip" },
  nav: { label: "Navigation" },
  footer: { label: "Footer" },
};

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
  const [activeSection, setActiveSection] = useState<string>("home");
  const [saving, setSaving] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Record<string, number>>({});
  const debounce = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const keys = useMemo(() => discoverKeys(), []);
  const sections = useMemo(() => Array.from(new Set(keys.map((k) => k.section))), [keys]);
  const sectionKeys = useMemo(
    () => keys.filter((k) => k.section === activeSection),
    [keys, activeSection]
  );

  function effective(key: string, def: string): string {
    return overrides[key]?.[lang] ?? def;
  }

  function setValue(key: string, value: string) {
    setOverrides((m) => {
      const next = { ...m };
      next[key] = { ...(next[key] ?? ({} as Record<Language, string>)), [lang]: value };
      return next;
    });
    const dKey = `${key}:${lang}`;
    if (debounce.current[dKey]) clearTimeout(debounce.current[dKey]);
    debounce.current[dKey] = setTimeout(async () => {
      setSaving(dKey);
      try {
        await fetch("/api/admin/content", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ key, language: lang, value }),
        });
        setSavedAt((s) => ({ ...s, [dKey]: Date.now() }));
      } finally {
        setSaving(null);
      }
    }, 500);
  }

  async function resetKey(key: string) {
    if (!confirm(`Reset "${prettyLabel(key.split(".").pop() ?? key)}" back to the default?`))
      return;
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

  const activeMeta = SECTION_META[activeSection] ?? { label: prettyLabel(activeSection) };

  return (
    <>
      <Head>
        <title>Admin · Content</title>
      </Head>
      <AdminLayout>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Edit content</h1>
            <p className="text-sm text-gray-400 mt-1">
              Edit any paragraph on the site. Saves as you type. Live within ~30s on prod.
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

        {/* Page tabs */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2 border-b border-gray-800">
          {sections.map((sec) => {
            const meta = SECTION_META[sec] ?? { label: prettyLabel(sec) };
            const isActive = sec === activeSection;
            return (
              <button
                key={sec}
                onClick={() => setActiveSection(sec)}
                className={`px-4 py-2 rounded-t-md text-sm whitespace-nowrap ${
                  isActive
                    ? "bg-gray-900 text-white border-b-2 border-amber-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {meta.label}
              </button>
            );
          })}
          {activeMeta.href && (
            <a
              href={activeMeta.href}
              target="_blank"
              rel="noreferrer"
              className="ml-auto text-xs text-amber-400 underline whitespace-nowrap pl-3"
            >
              ↗ preview {activeMeta.label}
            </a>
          )}
        </div>

        {/* Card stack — one per key */}
        <div className="space-y-4">
          {sectionKeys.map((k) => {
            const dKey = `${k.key}:${lang}`;
            const value = effective(k.key, "");
            const overridden = Boolean(overrides[k.key]?.[lang]);
            const status = saving === dKey
              ? "saving…"
              : savedAt[dKey]
                ? `saved ${new Date(savedAt[dKey]).toLocaleTimeString()}`
                : overridden
                  ? "custom"
                  : "default";

            return (
              <div
                key={k.key}
                className="bg-gray-900 border border-gray-800 rounded-lg p-4"
              >
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <div>
                    <div className="text-sm font-medium text-gray-200">{k.label}</div>
                    <div className="text-[10px] font-mono text-gray-600 mt-0.5">
                      {k.key}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-500">{status}</span>
                    {overridden && (
                      <button
                        onClick={() => resetKey(k.key)}
                        className="text-[10px] uppercase tracking-widest text-red-300 border border-red-900 hover:border-red-700 px-2 py-0.5 rounded"
                      >
                        reset
                      </button>
                    )}
                  </div>
                </div>

                {k.multiline ? (
                  <textarea
                    value={value}
                    onChange={(e) => setValue(k.key, e.target.value)}
                    placeholder={lang === "EN" ? k.defaultEn : `(${lang}) – defaults to EN`}
                    rows={Math.min(8, Math.max(3, Math.ceil((value.length || k.defaultEn.length) / 70)))}
                    className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm leading-relaxed text-gray-100 resize-y focus:outline-none focus:border-amber-500"
                  />
                ) : (
                  <input
                    value={value}
                    onChange={(e) => setValue(k.key, e.target.value)}
                    placeholder={lang === "EN" ? k.defaultEn : `(${lang}) – defaults to EN`}
                    className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
                  />
                )}

                {/* Show the default in non-EN tabs so the user has something to translate from */}
                {lang !== "EN" && !overridden && (
                  <p className="text-[11px] text-gray-500 mt-2 italic leading-relaxed">
                    EN default: {k.defaultEn}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-xs text-gray-500">
          Looking for something else?{" "}
          <Link href="/admin/sections" className="text-amber-400 underline">
            Add a new section
          </Link>{" "}
          on the {activeMeta.label} page.
        </div>
      </AdminLayout>
    </>
  );
}
