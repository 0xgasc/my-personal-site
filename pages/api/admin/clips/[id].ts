import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/admin/sessionAuth";
import { deleteClip, getClip, updateClip } from "@/lib/clips/store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;
  const id = typeof req.query.id === "string" ? req.query.id : null;
  if (!id) {
    res.status(400).json({ error: "Missing id" });
    return;
  }
  try {
    if (req.method === "GET") {
      const clip = await getClip(id);
      if (!clip) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.status(200).json({ clip });
      return;
    }
    if (req.method === "PATCH") {
      const clip = await updateClip(id, req.body ?? {});
      res.status(200).json({ clip });
      return;
    }
    if (req.method === "DELETE") {
      await deleteClip(id);
      res.status(204).end();
      return;
    }
    res.setHeader("Allow", "GET, PATCH, DELETE");
    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[/api/admin/clips/[id]]", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Server error" });
  }
}
