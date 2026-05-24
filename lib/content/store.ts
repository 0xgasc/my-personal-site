import { createClient } from "@supabase/supabase-js";

export type Language = "EN" | "ES" | "PT" | "FR";
export const LANGUAGES: Language[] = ["EN", "ES", "PT", "FR"];

export interface ContentEntry {
  key: string;
  language: Language;
  value: string;
  updatedAt: string;
}

const SCHEMA = process.env.SUPABASE_SCHEMA ?? "personal_site";

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars missing");
  return createClient(url, key, {
    db: { schema: SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

interface ContentRow {
  key: string;
  language: string;
  value: string;
  updated_at: string;
}

function rowTo(r: ContentRow): ContentEntry {
  return {
    key: r.key,
    language: (LANGUAGES as string[]).includes(r.language)
      ? (r.language as Language)
      : "EN",
    value: r.value ?? "",
    updatedAt: r.updated_at,
  };
}

export async function listAllContent(): Promise<ContentEntry[]> {
  const { data, error } = await admin()
    .from("content")
    .select("*")
    .order("key", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowTo);
}

export async function upsertContent(
  key: string,
  language: Language,
  value: string
): Promise<ContentEntry> {
  const { data, error } = await admin()
    .from("content")
    .upsert(
      { key, language, value, updated_at: new Date().toISOString() },
      { onConflict: "key,language" }
    )
    .select("*")
    .single();
  if (error) throw error;
  return rowTo(data);
}

export async function deleteContent(key: string, language: Language): Promise<void> {
  const { error } = await admin()
    .from("content")
    .delete()
    .eq("key", key)
    .eq("language", language);
  if (error) throw error;
}

/**
 * Build a nested override tree keyed by language then by dotted path.
 * e.g. content rows [{key:"home.greeting", language:"EN", value:"Hey"}] becomes
 *      { EN: { home: { greeting: "Hey" } } }
 * Applied on top of the static translations.js fallback.
 */
export type OverrideTree = Record<Language, Record<string, unknown>>;

function setDeep(target: Record<string, unknown>, dottedKey: string, value: string) {
  const parts = dottedKey.split(".");
  let cursor = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (typeof cursor[k] !== "object" || cursor[k] === null) cursor[k] = {};
    cursor = cursor[k] as Record<string, unknown>;
  }
  cursor[parts[parts.length - 1]] = value;
}

export async function buildOverrides(): Promise<OverrideTree> {
  const all = await listAllContent();
  const tree: OverrideTree = { EN: {}, ES: {}, PT: {}, FR: {} };
  for (const row of all) {
    if (!row.value) continue;
    setDeep(tree[row.language], row.key, row.value);
  }
  return tree;
}
