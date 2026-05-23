import { fileStore } from "./fileStore";
import { supabaseStore } from "./supabaseStore";
import { getStoreMode } from "./types";
import type { SceneStore } from "./types";

export function getStore(): SceneStore {
  return getStoreMode() === "local" ? fileStore : supabaseStore;
}

export { getStoreMode };
export type { SceneStore };
