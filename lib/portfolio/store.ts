import { createClient } from "@supabase/supabase-js";

export type PortfolioType = "project" | "stretch_study" | "music";

export interface PortfolioItem {
  id: string;
  type: PortfolioType;
  title: string;
  description: string;
  src: string;
  link: string;
  sortOrder: number;
  published: boolean;
  createdAt: string;
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

interface PortfolioRow {
  id: string;
  type: string;
  title: string;
  description: string;
  src: string;
  link: string;
  sort_order: number;
  published: boolean;
  created_at: string;
}

function rowTo(r: PortfolioRow): PortfolioItem {
  return {
    id: r.id,
    type: r.type as PortfolioType,
    title: r.title ?? "",
    description: r.description ?? "",
    src: r.src ?? "",
    link: r.link ?? "",
    sortOrder: r.sort_order ?? 0,
    published: r.published ?? true,
    createdAt: r.created_at,
  };
}

export async function listPublicItems(type?: PortfolioType): Promise<PortfolioItem[]> {
  let q = admin()
    .from("portfolio_items")
    .select("*")
    .eq("published", true)
    .order("sort_order");
  if (type) q = q.eq("type", type);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(rowTo);
}

export async function listAllItems(type?: PortfolioType): Promise<PortfolioItem[]> {
  let q = admin().from("portfolio_items").select("*").order("type").order("sort_order");
  if (type) q = q.eq("type", type);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(rowTo);
}

export async function createItem(
  input: Omit<PortfolioItem, "id" | "createdAt">
): Promise<PortfolioItem> {
  const { data, error } = await admin()
    .from("portfolio_items")
    .insert({
      type: input.type,
      title: input.title,
      description: input.description,
      src: input.src,
      link: input.link,
      sort_order: input.sortOrder,
      published: input.published,
    })
    .select("*")
    .single();
  if (error) throw error;
  return rowTo(data);
}

export async function updateItem(
  id: string,
  input: Partial<Omit<PortfolioItem, "id" | "createdAt">>
): Promise<PortfolioItem> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.type !== undefined) row.type = input.type;
  if (input.title !== undefined) row.title = input.title;
  if (input.description !== undefined) row.description = input.description;
  if (input.src !== undefined) row.src = input.src;
  if (input.link !== undefined) row.link = input.link;
  if (input.sortOrder !== undefined) row.sort_order = input.sortOrder;
  if (input.published !== undefined) row.published = input.published;
  const { data, error } = await admin()
    .from("portfolio_items")
    .update(row)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return rowTo(data);
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await admin().from("portfolio_items").delete().eq("id", id);
  if (error) throw error;
}
