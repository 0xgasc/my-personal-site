import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/admin/sessionAuth";
import { getStore } from "@/lib/store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;

  const id = typeof req.query.id === "string" ? req.query.id : null;
  if (!id) {
    res.status(400).json({ error: "Missing id" });
    return;
  }

  const store = getStore();

  if (req.method === "GET") {
    const scene = await store.get(id);
    if (!scene) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(200).json({ scene });
    return;
  }

  if (req.method === "PATCH") {
    const updated = await store.update(id, req.body ?? {});
    res.status(200).json({ scene: updated });
    return;
  }

  if (req.method === "DELETE") {
    await store.remove(id);
    res.status(204).end();
    return;
  }

  res.setHeader("Allow", "GET, PATCH, DELETE");
  res.status(405).json({ error: "Method not allowed" });
}
