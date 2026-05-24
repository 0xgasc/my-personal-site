import type { NextApiRequest, NextApiResponse } from "next";
import { buildOverrides } from "@/lib/content/store";

/**
 * Returns the nested override tree per-language. Merged client-side over the
 * static translations.js fallback in useTranslation().
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const overrides = await buildOverrides();
    res.setHeader(
      "Cache-Control",
      "public, max-age=15, s-maxage=30, stale-while-revalidate=120"
    );
    res.status(200).json({ overrides });
  } catch (err) {
    console.error("[/api/content/public]", err);
    res.status(200).json({ overrides: { EN: {}, ES: {}, PT: {}, FR: {} } });
  }
}
