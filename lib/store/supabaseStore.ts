import { createAdminClient } from "@/lib/supabase/admin";
import {
  createScene,
  deleteScene,
  getScene,
  getSettings,
  listAllScenes,
  listPublicScenes,
  updateScene,
  updateSettings,
} from "@/lib/scenes/queries";
import type { SceneStore } from "./types";

function client() {
  return createAdminClient();
}

export const supabaseStore: SceneStore = {
  listAll: () => listAllScenes(client()),
  listPublic: () => listPublicScenes(client()),
  get: (id) => getScene(client(), id),
  create: (input) => createScene(client(), input),
  update: (id, input) => updateScene(client(), id, input),
  remove: (id) => deleteScene(client(), id),
  getSettings: () => getSettings(client()),
  updateSettings: (input) => updateSettings(client(), input),
};
