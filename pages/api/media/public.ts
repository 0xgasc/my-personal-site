import type { NextApiRequest, NextApiResponse } from "next";
import { listAllMedia } from "@/lib/cms/store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const rows = await listAllMedia();
    const map: Record<string, { url: string; alt: string }> = {};
    for (const r of rows) map[r.key] = { url: r.url, alt: r.alt };
    res.setHeader(
      "Cache-Control",
      "public, max-age=15, s-maxage=30, stale-while-revalidate=120"
    );
    res.status(200).json({ media: map });
  } catch (err) {
    console.error("[/api/media/public]", err);
    res.status(200).json({ media: {} });
  }
}
