import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/admin/sessionAuth";

/**
 * Scenes API — retired. The site no longer uses the scene-builder; backgrounds
 * are env-var driven (NEXT_PUBLIC_BG_CLIPS) and FX is shader-only. This
 * endpoint stays in place to return a graceful 410 to any stale client.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;
  if (req.method === "GET") {
    res.status(200).json({ scenes: [] });
    return;
  }
  res.status(410).json({
    error: "Scenes are retired. Use /admin/upload + NEXT_PUBLIC_BG_CLIPS env var.",
  });
}
