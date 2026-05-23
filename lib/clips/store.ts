import { createClient } from "@supabase/supabase-js";
import { rowToClip, clipToRow, type Clip } from "./types";

const SCHEMA = process.env.SUPABASE_SCHEMA ?? "personal_site";

/**
 * Service-role Supabase client scoped to the personal_site schema.
 * Server-only. Bypasses RLS.
 */
function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase env vars missing (URL / SERVICE_ROLE_KEY)");
  }
  return createClient(url, key, {
    db: { schema: SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function listPublicClips(): Promise<Clip[]> {
  const { data, error } = await admin()
    .from("clips")
    .select("*")
    .eq("is_public", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToClip);
}

export async function listAllClips(): Promise<Clip[]> {
  const { data, error } = await admin()
    .from("clips")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToClip);
}

export async function getClip(id: string): Promise<Clip | null> {
  const { data, error } = await admin().from("clips").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToClip(data) : null;
}

export async function createClip(input: Partial<Clip>): Promise<Clip> {
  const { data, error } = await admin()
    .from("clips")
    .insert(clipToRow(input))
    .select("*")
    .single();
  if (error) throw error;
  return rowToClip(data);
}

export async function updateClip(id: string, input: Partial<Clip>): Promise<Clip> {
  const row = clipToRow(input);
  row.updated_at = new Date().toISOString() as never;
  const { data, error } = await admin()
    .from("clips")
    .update(row)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return rowToClip(data);
}

export async function deleteClip(id: string): Promise<void> {
  const { error } = await admin().from("clips").delete().eq("id", id);
  if (error) throw error;
}
