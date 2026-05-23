import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/admin/sessionAuth";
import { getStore } from "@/lib/store";

/**
 * Returns a single scene + current site settings, regardless of isPublic.
 * Admin-gated: only callable from a browser with the admin session cookie.
 * Used by the "Open preview" button in the scene editor.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!requireAdmin(req, res)) return;

  const id = typeof req.query.id === "string" ? req.query.id : null;
  if (!id) {
    res.status(400).json({ error: "Missing id" });
    return;
  }

  const store = getStore();
  const [scene, settings] = await Promise.all([store.get(id), store.getSettings()]);
  if (!scene) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ scenes: [scene], settings });
}
