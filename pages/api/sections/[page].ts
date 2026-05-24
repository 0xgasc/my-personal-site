import type { NextApiRequest, NextApiResponse } from "next";
import { listSectionsForPage } from "@/lib/cms/store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const page = typeof req.query.page === "string" ? req.query.page : null;
  if (!page) {
    res.status(400).json({ error: "Missing page" });
    return;
  }
  try {
    const sections = await listSectionsForPage(page, false);
    res.setHeader(
      "Cache-Control",
      "public, max-age=15, s-maxage=30, stale-while-revalidate=120"
    );
    res.status(200).json({ sections });
  } catch (err) {
    console.error("[/api/sections/[page]]", err);
    res.status(200).json({ sections: [] });
  }
}
