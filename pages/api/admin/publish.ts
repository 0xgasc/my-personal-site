import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/admin/sessionAuth";
import { readSnapshotForPublish } from "@/lib/store/fileStore";
import { createAdminClient } from "@/lib/supabase/admin";
import { sceneToRow, settingsToRow } from "@/lib/scenes/mappers";

/**
 * Pushes the local scenes file → Supabase. The remote tables become an exact
 * mirror of the local file: every local scene is upserted by id, and any
 * remote scene whose id isn't in the local file is deleted.
 *
 * Requires:
 *   - admin session
 *   - SUPABASE_SERVICE_ROLE_KEY available (server-side)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    res.status(500).json({
      error: "Supabase env vars missing — cannot publish.",
    });
    return;
  }

  try {
    const snapshot = await readSnapshotForPublish();
    const admin = createAdminClient();

    // 1. Upsert all local scenes (insert or update by id).
    const sceneRows = snapshot.scenes.map((s) => ({
      id: s.id,
      ...sceneToRow(s),
    }));
    if (sceneRows.length) {
      const { error } = await admin.from("scenes").upsert(sceneRows, { onConflict: "id" });
      if (error) throw error;
    }

    // 2. Delete remote scenes that no longer exist locally.
    const { data: remoteIds, error: listErr } = await admin.from("scenes").select("id");
    if (listErr) throw listErr;
    const localIds = new Set(snapshot.scenes.map((s) => s.id));
    const idsToDelete = (remoteIds ?? [])
      .map((r) => r.id as string)
      .filter((id) => !localIds.has(id));
    if (idsToDelete.length) {
      const { error } = await admin.from("scenes").delete().in("id", idsToDelete);
      if (error) throw error;
    }

    // 3. Update site_settings.
    const settingsRow = settingsToRow(snapshot.settings);
    const { error: setErr } = await admin
      .from("site_settings")
      .update(settingsRow)
      .eq("id", "default");
    if (setErr) throw setErr;

    res.status(200).json({
      ok: true,
      published: snapshot.scenes.length,
      removed: idsToDelete.length,
    });
  } catch (err) {
    console.error("[/api/admin/publish]", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Publish failed" });
  }
}
