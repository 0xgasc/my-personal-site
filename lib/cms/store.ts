import { createClient } from "@supabase/supabase-js";

export interface MediaEntry {
  key: string;
  url: string;
  alt: string;
  updatedAt: string;
}

export type SectionType =
  | "heading"
  | "paragraph"
  | "image"
  | "link"
  | "divider"
  | "embed"
  | "gallery"
  | "raw_html"
  | "counter"
  | "two_column"
  | "accordion"
  | "cta_button"
  | "video_player";

export interface Section {
  id: string;
  page: string;
  sortOrder: number;
  type: SectionType;
  data: Record<string, unknown>;
  isPublic: boolean;
}

export interface PageRow {
  slug: string;
  title: string;
  isPublic: boolean;
  sortOrder: number;
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

// ─── Media ──────────────────────────────────────────────────
interface MediaRow {
  key: string;
  url: string;
  alt: string;
  updated_at: string;
}
const mRow = (r: MediaRow): MediaEntry => ({
  key: r.key,
  url: r.url,
  alt: r.alt ?? "",
  updatedAt: r.updated_at,
});

export async function listAllMedia(): Promise<MediaEntry[]> {
  const { data, error } = await admin().from("media").select("*").order("key");
  if (error) throw error;
  return (data ?? []).map(mRow);
}
export async function upsertMedia(key: string, url: string, alt = ""): Promise<MediaEntry> {
  const { data, error } = await admin()
    .from("media")
    .upsert({ key, url, alt, updated_at: new Date().toISOString() }, { onConflict: "key" })
    .select("*")
    .single();
  if (error) throw error;
  return mRow(data);
}
export async function deleteMedia(key: string): Promise<void> {
  const { error } = await admin().from("media").delete().eq("key", key);
  if (error) throw error;
}

// ─── Sections ───────────────────────────────────────────────
interface SectionRow {
  id: string;
  page: string;
  sort_order: number;
  type: string;
  data: Record<string, unknown> | string;
  is_public: boolean;
  updated_at?: string;
}
const sRow = (r: SectionRow): Section => ({
  id: r.id,
  page: r.page,
  sortOrder: r.sort_order,
  type: r.type as SectionType,
  data: typeof r.data === "string" ? safeParse(r.data) : r.data,
  isPublic: r.is_public,
});
function safeParse(s: string): Record<string, unknown> {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

export async function listSectionsForPage(page: string, includePrivate = false): Promise<Section[]> {
  let q = admin().from("page_sections").select("*").eq("page", page).order("sort_order");
  if (!includePrivate) q = q.eq("is_public", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(sRow);
}
export async function listAllSections(): Promise<Section[]> {
  const { data, error } = await admin()
    .from("page_sections")
    .select("*")
    .order("page")
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map(sRow);
}
export async function createSection(input: Omit<Section, "id">): Promise<Section> {
  const { data, error } = await admin()
    .from("page_sections")
    .insert({
      page: input.page,
      sort_order: input.sortOrder,
      type: input.type,
      data: input.data,
      is_public: input.isPublic,
    })
    .select("*")
    .single();
  if (error) throw error;
  return sRow(data);
}
export async function updateSection(id: string, input: Partial<Section>): Promise<Section> {
  const row: Partial<SectionRow> = { updated_at: new Date().toISOString() as never };
  if (input.page !== undefined) row.page = input.page;
  if (input.sortOrder !== undefined) row.sort_order = input.sortOrder;
  if (input.type !== undefined) row.type = input.type;
  if (input.data !== undefined) row.data = input.data;
  if (input.isPublic !== undefined) row.is_public = input.isPublic;
  const { data, error } = await admin().from("page_sections").update(row).eq("id", id).select("*").single();
  if (error) throw error;
  return sRow(data);
}
export async function deleteSection(id: string): Promise<void> {
  const { error } = await admin().from("page_sections").delete().eq("id", id);
  if (error) throw error;
}

// ─── Pages ──────────────────────────────────────────────────
interface PageRowDb {
  slug: string;
  title: string;
  is_public: boolean;
  sort_order: number;
  updated_at?: string;
}
const pRow = (r: PageRowDb): PageRow => ({
  slug: r.slug,
  title: r.title,
  isPublic: r.is_public,
  sortOrder: r.sort_order,
  updatedAt: r.updated_at ?? "",
});
export async function listAllPages(): Promise<PageRow[]> {
  const { data, error } = await admin().from("pages").select("*").order("sort_order");
  if (error) throw error;
  return (data ?? []).map(pRow);
}
export async function getPage(slug: string): Promise<PageRow | null> {
  const { data, error } = await admin().from("pages").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? pRow(data) : null;
}
export async function upsertPage(input: Partial<PageRow> & { slug: string }): Promise<PageRow> {
  const row: Partial<PageRowDb> = { slug: input.slug, updated_at: new Date().toISOString() as never };
  if (input.title !== undefined) row.title = input.title;
  if (input.isPublic !== undefined) row.is_public = input.isPublic;
  if (input.sortOrder !== undefined) row.sort_order = input.sortOrder;
  const { data, error } = await admin().from("pages").upsert(row, { onConflict: "slug" }).select("*").single();
  if (error) throw error;
  return pRow(data);
}
export async function deletePage(slug: string): Promise<void> {
  const { error } = await admin().from("pages").delete().eq("slug", slug);
  if (error) throw error;
}
