import type { Scene, SiteSettings } from "@/lib/types";

export interface SceneStore {
  listAll(): Promise<Scene[]>;
  listPublic(): Promise<Scene[]>;
  get(id: string): Promise<Scene | null>;
  create(input: Partial<Scene>): Promise<Scene>;
  update(id: string, input: Partial<Scene>): Promise<Scene>;
  remove(id: string): Promise<void>;
  getSettings(): Promise<SiteSettings>;
  updateSettings(input: Partial<SiteSettings>): Promise<SiteSettings>;
}

export type StoreMode = "local" | "remote";

export function getStoreMode(): StoreMode {
  if (process.env.STORE_MODE === "local") return "local";
  if (process.env.STORE_MODE === "remote") return "remote";
  return process.env.NODE_ENV === "production" ? "remote" : "local";
}
