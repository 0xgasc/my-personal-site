import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/admin/sessionAuth";
import { deletePage, listAllPages, upsertPage } from "@/lib/cms/store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;
  try {
    if (req.method === "GET") {
      const pages = await listAllPages();
      res.status(200).json({ pages });
      return;
    }
    if (req.method === "POST") {
      const body = req.body ?? {};
      if (!body.slug || typeof body.slug !== "string") {
        res.status(400).json({ error: "Missing slug" });
        return;
      }
      if (!/^[a-z0-9-]+$/.test(body.slug)) {
        res.status(400).json({ error: "Slug must be lowercase alphanumeric + hyphens" });
        return;
      }
      const page = await upsertPage({
        slug: body.slug,
        title: body.title ?? body.slug,
        isPublic: body.isPublic ?? true,
        sortOrder: body.sortOrder ?? 0,
      });
      res.status(201).json({ page });
      return;
    }
    if (req.method === "PATCH") {
      const body = req.body ?? {};
      if (!body.slug) {
        res.status(400).json({ error: "Missing slug" });
        return;
      }
      const page = await upsertPage(body);
      res.status(200).json({ page });
      return;
    }
    if (req.method === "DELETE") {
      const { slug } = (req.body ?? {}) as { slug?: string };
      if (!slug) {
        res.status(400).json({ error: "Missing slug" });
        return;
      }
      await deletePage(slug);
      res.status(204).end();
      return;
    }
    res.setHeader("Allow", "GET, POST, PATCH, DELETE");
    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[/api/admin/pages]", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Server error" });
  }
}
