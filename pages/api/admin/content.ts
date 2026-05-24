import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/admin/sessionAuth";
import { deleteContent, listAllContent, upsertContent, LANGUAGES } from "@/lib/content/store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;
  try {
    if (req.method === "GET") {
      const rows = await listAllContent();
      res.status(200).json({ rows });
      return;
    }
    if (req.method === "PATCH") {
      const { key, language, value } = (req.body ?? {}) as {
        key?: string;
        language?: string;
        value?: string;
      };
      if (!key || !language || typeof value !== "string") {
        res.status(400).json({ error: "Missing key/language/value" });
        return;
      }
      if (!LANGUAGES.includes(language as never)) {
        res.status(400).json({ error: "Invalid language" });
        return;
      }
      const entry = await upsertContent(key, language as never, value);
      res.status(200).json({ entry });
      return;
    }
    if (req.method === "DELETE") {
      const { key, language } = (req.body ?? {}) as { key?: string; language?: string };
      if (!key || !language) {
        res.status(400).json({ error: "Missing key/language" });
        return;
      }
      await deleteContent(key, language as never);
      res.status(204).end();
      return;
    }
    res.setHeader("Allow", "GET, PATCH, DELETE");
    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[/api/admin/content]", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Server error" });
  }
}
