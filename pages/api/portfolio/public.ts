import type { NextApiRequest, NextApiResponse } from "next";
import { listPublicItems, type PortfolioType } from "@/lib/portfolio/store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();
  try {
    const type = req.query.type as PortfolioType | undefined;
    const items = await listPublicItems(type);
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    res.status(200).json({ items });
  } catch (err) {
    console.error("[portfolio/public]", err);
    res.status(500).json({ error: "Failed to fetch" });
  }
}
