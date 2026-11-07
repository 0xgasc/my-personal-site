import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/admin/sessionAuth";
import { deleteEntry, listEntries, setApproved } from "@/lib/guestbook/store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.method === "GET") {
      const entries = await listEntries(true);
      return res.status(200).json({ entries });
    }
    const id = typeof req.query.id === "string" ? req.query.id : "";
    if (!id) return res.status(400).json({ error: "Missing id" });
    if (req.method === "PATCH") {
      await setApproved(id, req.body?.approved === true);
      return res.status(200).json({ ok: true });
    }
    if (req.method === "DELETE") {
      await deleteEntry(id);
      return res.status(204).end();
    }
    res.setHeader("Allow", "GET, PATCH, DELETE");
    return res.status(405).end();
  } catch (err) {
    console.error("[admin/guestbook]", err);
    return res.status(500).json({ error: "Server error" });
  }
}
