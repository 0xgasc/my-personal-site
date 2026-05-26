import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/admin/sessionAuth";
import { listAllItems, createItem, type PortfolioType } from "@/lib/portfolio/store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;
  try {
    if (req.method === "GET") {
      const type = req.query.type as PortfolioType | undefined;
      const items = await listAllItems(type);
      return res.status(200).json({ items });
    }
    if (req.method === "POST") {
      const { type, title, description, src, link, sortOrder, published } = req.body ?? {};
      if (!type || !["project", "stretch_study", "music"].includes(type)) {
        return res.status(400).json({ error: "Invalid type" });
      }
      const item = await createItem({
        type,
        title: title ?? "",
        description: description ?? "",
        src: src ?? "",
        link: link ?? "",
        sortOrder: sortOrder ?? 0,
        published: published !== false,
      });
      return res.status(201).json({ item });
    }
    return res.status(405).end();
  } catch (err) {
    console.error("[admin/portfolio]", err);
    res.status(500).json({ error: "Server error" });
  }
}
