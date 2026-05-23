import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/admin/sessionAuth";
import { getStore } from "@/lib/store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;

  const store = getStore();

  if (req.method === "GET") {
    const settings = await store.getSettings();
    res.status(200).json({ settings });
    return;
  }

  if (req.method === "PATCH") {
    const updated = await store.updateSettings(req.body ?? {});
    res.status(200).json({ settings: updated });
    return;
  }

  res.setHeader("Allow", "GET, PATCH");
  res.status(405).json({ error: "Method not allowed" });
}
