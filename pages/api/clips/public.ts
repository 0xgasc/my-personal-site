import type { NextApiRequest, NextApiResponse } from "next";
import { listPublicClips } from "@/lib/clips/store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const clips = await listPublicClips();
    res.setHeader(
      "Cache-Control",
      "public, max-age=10, s-maxage=30, stale-while-revalidate=60"
    );
    res.status(200).json({ clips });
  } catch (err) {
    console.error("[/api/clips/public]", err);
    res.status(200).json({ clips: [] });
  }
}
