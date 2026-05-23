import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import type { Scene, SiteSettings } from "@/lib/types";
import { DEFAULT_SCENE, DEFAULT_SETTINGS } from "@/lib/types";
import type { SceneStore } from "./types";

const FILE_PATH = path.join(process.cwd(), "data", "scenes.local.json");

interface Snapshot {
  scenes: Scene[];
  settings: SiteSettings;
}

async function ensureDir() {
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
}

function migrateScene(raw: unknown): Scene {
  // Backfill any fields a pre-rebuild scene might be missing so the UI never
  // chokes on undefined when an old local file is loaded.
  const r = (raw as Record<string, unknown>) ?? {};
  const merged = { ...DEFAULT_SCENE, ...r } as Scene;
  if (!merged.id) merged.id = (r.id as string) ?? crypto.randomUUID();
  if (!merged.createdAt) merged.createdAt = new Date().toISOString();
  if (!merged.updatedAt) merged.updatedAt = new Date().toISOString();
  if (!merged.fxParams || typeof merged.fxParams !== "object") {
    merged.fxParams = DEFAULT_SCENE.fxParams;
  }
  if (!merged.hover || typeof merged.hover !== "object") {
    merged.hover = { ...DEFAULT_SCENE.hover };
  }
  if (typeof merged.blendMode !== "string") {
    merged.blendMode = DEFAULT_SCENE.blendMode;
  }
  return merged;
}

async function readSnapshot(): Promise<Snapshot> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<Snapshot>;
    const scenes = Array.isArray(parsed.scenes) ? parsed.scenes.map(migrateScene) : [];
    return {
      scenes,
      settings: parsed.settings ?? defaultSettings(),
    };
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { scenes: [], settings: defaultSettings() };
    }
    throw err;
  }
}

async function writeSnapshot(snap: Snapshot): Promise<void> {
  await ensureDir();
  const tmp = `${FILE_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(snap, null, 2), "utf-8");
  await fs.rename(tmp, FILE_PATH);
}

function defaultSettings(): SiteSettings {
  const now = new Date().toISOString();
  return { id: "default", ...DEFAULT_SETTINGS, updatedAt: now };
}

export const fileStore: SceneStore = {
  async listAll() {
    const snap = await readSnapshot();
    return [...snap.scenes].sort((a, b) => a.sortOrder - b.sortOrder);
  },
  async listPublic() {
    const snap = await readSnapshot();
    return snap.scenes
      .filter((s) => s.isPublic)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },
  async get(id) {
    const snap = await readSnapshot();
    return snap.scenes.find((s) => s.id === id) ?? null;
  },
  async create(input) {
    const snap = await readSnapshot();
    const now = new Date().toISOString();
    const next: Scene = {
      ...DEFAULT_SCENE,
      ...input,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    snap.scenes.push(next);
    await writeSnapshot(snap);
    return next;
  },
  async update(id, input) {
    const snap = await readSnapshot();
    const idx = snap.scenes.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error("Scene not found");
    const merged: Scene = {
      ...snap.scenes[idx],
      ...input,
      id,
      updatedAt: new Date().toISOString(),
    };
    snap.scenes[idx] = merged;
    await writeSnapshot(snap);
    return merged;
  },
  async remove(id) {
    const snap = await readSnapshot();
    snap.scenes = snap.scenes.filter((s) => s.id !== id);
    await writeSnapshot(snap);
  },
  async getSettings() {
    const snap = await readSnapshot();
    return snap.settings;
  },
  async updateSettings(input) {
    const snap = await readSnapshot();
    snap.settings = {
      ...snap.settings,
      ...input,
      id: "default",
      updatedAt: new Date().toISOString(),
    };
    await writeSnapshot(snap);
    return snap.settings;
  },
};

export async function readSnapshotForPublish(): Promise<Snapshot> {
  return readSnapshot();
}
