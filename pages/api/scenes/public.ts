import type { NextApiRequest, NextApiResponse } from "next";
import { getStore, getStoreMode } from "@/lib/store";
import { DEFAULT_SETTINGS } from "@/lib/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const store = getStore();
    const [scenes, settings] = await Promise.all([store.listPublic(), store.getSettings()]);
    if (getStoreMode() === "remote") {
      res.setHeader(
        "Cache-Control",
        "public, max-age=15, s-maxage=30, stale-while-revalidate=60"
      );
    } else {
      res.setHeader("Cache-Control", "no-store");
    }
    res.status(200).json({ scenes, settings });
  } catch (err) {
    console.error("[/api/scenes/public]", err);
    res.status(200).json({
      scenes: [],
      settings: { id: "default", ...DEFAULT_SETTINGS, updatedAt: new Date().toISOString() },
    });
  }
}
