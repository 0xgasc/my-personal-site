import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/admin/sessionAuth";
import { deleteSection, updateSection } from "@/lib/cms/store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;
  const id = typeof req.query.id === "string" ? req.query.id : null;
  if (!id) {
    res.status(400).json({ error: "Missing id" });
    return;
  }
  try {
    if (req.method === "PATCH") {
      const section = await updateSection(id, req.body ?? {});
      res.status(200).json({ section });
      return;
    }
    if (req.method === "DELETE") {
      await deleteSection(id);
      res.status(204).end();
      return;
    }
    res.setHeader("Allow", "PATCH, DELETE");
    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[/api/admin/sections/[id]]", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Server error" });
  }
}
