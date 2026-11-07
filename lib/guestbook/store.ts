import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Guestbook remixes. Visitors remix an art piece with the FX shaders and
 * submit it; entries stay hidden until approved in /admin/guestbook.
 *
 * Stored as rows in `page_sections` under the reserved page "_guestbook"
 * (no route can match a leading underscore, and /api/sections refuses it),
 * with `is_public` = approved. Images live in a public Storage bucket.
 * Everything goes through this file, so moving to a dedicated table later
 * only touches this module.
 */

const PAGE = "_guestbook";
const TYPE = "remix";
const BUCKET = "personal-site-guestbook";

export interface GuestbookEntry {
  id: string;
  name: string;
  note: string;
  imageUrl: string;
  piece: { title: string; src: string; link: string };
  fx: { mode: string; wet: number; amount: number };
  approved: boolean;
  createdAt: string;
}

interface Row {
  id: string;
  data: Record<string, unknown> | string;
  is_public: boolean;
  updated_at?: string;
}

const admin = () => createAdminClient();

function parse(d: Row["data"]): Record<string, unknown> {
  if (typeof d !== "string") return d ?? {};
  try {
    return JSON.parse(d);
  } catch {
    return {};
  }
}

function toEntry(r: Row): GuestbookEntry {
  const d = parse(r.data);
  const piece = (d.piece ?? {}) as Record<string, unknown>;
  const fx = (d.fx ?? {}) as Record<string, unknown>;
  return {
    id: r.id,
    name: String(d.name ?? ""),
    note: String(d.note ?? ""),
    imageUrl: String(d.imageUrl ?? ""),
    piece: { title: String(piece.title ?? ""), src: String(piece.src ?? ""), link: String(piece.link ?? "") },
    fx: { mode: String(fx.mode ?? "off"), wet: Number(fx.wet ?? 1), amount: Number(fx.amount ?? 0.5) },
    approved: r.is_public,
    createdAt: String(d.createdAt ?? r.updated_at ?? ""),
  };
}

export async function listEntries(includePending: boolean): Promise<GuestbookEntry[]> {
  let q = admin().from("page_sections").select("id,data,is_public,updated_at").eq("page", PAGE).eq("type", TYPE);
  if (!includePending) q = q.eq("is_public", true);
  const { data, error } = await q.order("sort_order", { ascending: false }).limit(500);
  if (error) throw error;
  return (data ?? []).map(toEntry);
}

/** Hash so we can rate-limit without keeping visitors' IPs. */
export function hashIp(ip: string): string {
  const salt = process.env.ADMIN_COOKIE_SECRET ?? "guestbook";
  return crypto.createHmac("sha256", salt).update(ip).digest("hex").slice(0, 24);
}

/** Submissions from this IP hash in the last hour. */
export async function recentCount(ipHash: string): Promise<number> {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data, error } = await admin()
    .from("page_sections")
    .select("data,updated_at")
    .eq("page", PAGE)
    .gte("updated_at", since)
    .limit(200);
  if (error) throw error;
  return (data ?? []).filter((r) => parse(r.data as Row["data"]).ipHash === ipHash).length;
}

async function ensureBucket() {
  const storage = admin().storage;
  const { data } = await storage.getBucket(BUCKET);
  if (data) return;
  const { error } = await storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 3 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg"],
  });
  if (error && !/already exists/i.test(error.message)) throw error;
}

export async function createEntry(input: {
  name: string;
  note: string;
  jpeg: Buffer;
  piece: GuestbookEntry["piece"];
  fx: GuestbookEntry["fx"];
  ipHash: string;
}): Promise<GuestbookEntry> {
  await ensureBucket();
  const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.jpg`;
  const storage = admin().storage.from(BUCKET);
  const up = await storage.upload(path, input.jpeg, { contentType: "image/jpeg", upsert: false });
  if (up.error) throw up.error;
  const imageUrl = storage.getPublicUrl(path).data.publicUrl;

  const now = new Date();
  const { data, error } = await admin()
    .from("page_sections")
    .insert({
      page: PAGE,
      type: TYPE,
      // Newest first: sort by submit time in seconds.
      sort_order: Math.floor(now.getTime() / 1000),
      is_public: false,
      data: {
        name: input.name,
        note: input.note,
        imageUrl,
        imagePath: path,
        piece: input.piece,
        fx: input.fx,
        ipHash: input.ipHash,
        createdAt: now.toISOString(),
      },
    })
    .select("id,data,is_public,updated_at")
    .single();
  if (error) {
    await storage.remove([path]).catch(() => {});
    throw error;
  }
  return toEntry(data as Row);
}

export async function setApproved(id: string, approved: boolean): Promise<void> {
  const { error } = await admin()
    .from("page_sections")
    .update({ is_public: approved, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("page", PAGE);
  if (error) throw error;
}

export async function deleteEntry(id: string): Promise<void> {
  const { data } = await admin().from("page_sections").select("data").eq("id", id).eq("page", PAGE).single();
  const path = data ? parse(data.data as Row["data"]).imagePath : null;
  const { error } = await admin().from("page_sections").delete().eq("id", id).eq("page", PAGE);
  if (error) throw error;
  if (typeof path === "string" && path) await admin().storage.from(BUCKET).remove([path]).catch(() => {});
}
