import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/admin/sessionAuth";
import { updateItem, deleteItem } from "@/lib/portfolio/store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;
  const id = req.query.id as string;
  try {
    if (req.method === "PATCH") {
      const { type, title, description, src, link, sortOrder, published } = req.body ?? {};
      const item = await updateItem(id, { type, title, description, src, link, sortOrder, published });
      return res.status(200).json({ item });
    }
    if (req.method === "DELETE") {
      await deleteItem(id);
      return res.status(204).end();
    }
    return res.status(405).end();
  } catch (err) {
    console.error("[admin/portfolio/id]", err);
    res.status(500).json({ error: "Server error" });
  }
}
