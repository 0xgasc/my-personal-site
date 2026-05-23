import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/admin/sessionAuth";
import { createClip, listAllClips } from "@/lib/clips/store";
import { DEFAULT_CLIP } from "@/lib/clips/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;
  try {
    if (req.method === "GET") {
      const clips = await listAllClips();
      res.status(200).json({ clips });
      return;
    }
    if (req.method === "POST") {
      const input = { ...DEFAULT_CLIP, ...(req.body ?? {}) };
      if (!input.videoUrl) {
        res.status(400).json({ error: "videoUrl required" });
        return;
      }
      const clip = await createClip(input);
      res.status(201).json({ clip });
      return;
    }
    res.setHeader("Allow", "GET, POST");
    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[/api/admin/clips]", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Server error" });
  }
}
