import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/admin/sessionAuth";
import { deleteMedia, listAllMedia, upsertMedia } from "@/lib/cms/store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;
  try {
    if (req.method === "GET") {
      const rows = await listAllMedia();
      res.status(200).json({ rows });
      return;
    }
    if (req.method === "PATCH") {
      const { key, url, alt } = (req.body ?? {}) as { key?: string; url?: string; alt?: string };
      if (!key || !url) {
        res.status(400).json({ error: "Missing key or url" });
        return;
      }
      const entry = await upsertMedia(key, url, alt ?? "");
      res.status(200).json({ entry });
      return;
    }
    if (req.method === "DELETE") {
      const { key } = (req.body ?? {}) as { key?: string };
      if (!key) {
        res.status(400).json({ error: "Missing key" });
        return;
      }
      await deleteMedia(key);
      res.status(204).end();
      return;
    }
    res.setHeader("Allow", "GET, PATCH, DELETE");
    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[/api/admin/media]", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Server error" });
  }
}
