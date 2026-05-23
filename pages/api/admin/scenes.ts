import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/admin/sessionAuth";
import { getStore } from "@/lib/store";
import { DEFAULT_SCENE } from "@/lib/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;

  const store = getStore();

  if (req.method === "GET") {
    const scenes = await store.listAll();
    res.status(200).json({ scenes });
    return;
  }

  if (req.method === "POST") {
    const body = (req.body ?? {}) as Partial<typeof DEFAULT_SCENE> & { name?: string };
    const created = await store.create({ ...DEFAULT_SCENE, ...body });
    res.status(201).json({ scene: created });
    return;
  }

  res.setHeader("Allow", "GET, POST");
  res.status(405).json({ error: "Method not allowed" });
}
