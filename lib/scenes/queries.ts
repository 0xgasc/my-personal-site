import type { SupabaseClient } from "@supabase/supabase-js";
import type { Scene, SiteSettings } from "@/lib/types";
import { rowToScene, rowToSettings, sceneToRow, settingsToRow } from "./mappers";

type AnyClient = SupabaseClient<any, any, any, any, any>;

export async function listPublicScenes(client: AnyClient): Promise<Scene[]> {
  const { data, error } = await client
    .from("scenes")
    .select("*")
    .eq("is_public", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToScene);
}

export async function listAllScenes(client: AnyClient): Promise<Scene[]> {
  const { data, error } = await client
    .from("scenes")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToScene);
}

export async function getScene(client: AnyClient, id: string): Promise<Scene | null> {
  const { data, error } = await client.from("scenes").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToScene(data) : null;
}

export async function createScene(
  client: AnyClient,
  input: Partial<Scene>
): Promise<Scene> {
  const { data, error } = await client
    .from("scenes")
    .insert(sceneToRow(input))
    .select("*")
    .single();
  if (error) throw error;
  return rowToScene(data);
}

export async function updateScene(
  client: AnyClient,
  id: string,
  input: Partial<Scene>
): Promise<Scene> {
  const { data, error } = await client
    .from("scenes")
    .update(sceneToRow(input))
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return rowToScene(data);
}

export async function deleteScene(client: AnyClient, id: string): Promise<void> {
  const { error } = await client.from("scenes").delete().eq("id", id);
  if (error) throw error;
}

export async function getSettings(client: AnyClient): Promise<SiteSettings> {
  const { data, error } = await client
    .from("site_settings")
    .select("*")
    .eq("id", "default")
    .single();
  if (error) throw error;
  return rowToSettings(data);
}

export async function updateSettings(
  client: AnyClient,
  input: Partial<SiteSettings>
): Promise<SiteSettings> {
  const { data, error } = await client
    .from("site_settings")
    .update(settingsToRow(input))
    .eq("id", "default")
    .select("*")
    .single();
  if (error) throw error;
  return rowToSettings(data);
}
