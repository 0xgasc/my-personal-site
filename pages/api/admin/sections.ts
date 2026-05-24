import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/admin/sessionAuth";
import { createSection, listAllSections } from "@/lib/cms/store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;
  try {
    if (req.method === "GET") {
      const sections = await listAllSections();
      res.status(200).json({ sections });
      return;
    }
    if (req.method === "POST") {
      const body = req.body ?? {};
      if (!body.page || !body.type) {
        res.status(400).json({ error: "Missing page or type" });
        return;
      }
      const section = await createSection({
        page: body.page,
        sortOrder: body.sortOrder ?? 0,
        type: body.type,
        data: body.data ?? {},
        isPublic: body.isPublic ?? true,
      });
      res.status(201).json({ section });
      return;
    }
    res.setHeader("Allow", "GET, POST");
    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[/api/admin/sections]", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Server error" });
  }
}
