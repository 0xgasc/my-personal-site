import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/admin/sessionAuth";

/**
 * Returns the Stash API key to authed admin sessions only. The key never
 * lands in the public JS bundle — the upload component fetches it after
 * login and passes it inline to TUS as `X-API-Key`.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const key = process.env.STASH_API_KEY;
  if (!key) {
    res.status(204).end();
    return;
  }
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ apiKey: key });
}
