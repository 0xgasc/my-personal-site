import type { NextApiRequest, NextApiResponse } from "next";
import { createEntry, hashIp, listEntries, recentCount } from "@/lib/guestbook/store";

export const config = { api: { bodyParser: { sizeLimit: "4mb" } } };

const MAX_PER_HOUR = 6;
const MAX_IMAGE_BYTES = 2.5 * 1024 * 1024;

function clientIp(req: NextApiRequest): string {
  const fwd = req.headers["x-forwarded-for"];
  const first = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(",")[0]?.trim();
  return first || req.socket.remoteAddress || "unknown";
}

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max) : "";

/** Only art that's on this site can be remixed: local files, the image proxy, or earlier remixes. */
function allowedPieceSrc(src: string): boolean {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const host = new URL(src).hostname;
    return host === "images.weserv.nl" || host === new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://x").hostname;
  } catch {
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const entries = await listEntries(false);
      res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120");
      return res.status(200).json({
        entries: entries.map(({ id, name, note, imageUrl, piece, fx, createdAt }) => ({
          id, name, note, imageUrl, piece, fx, createdAt,
        })),
      });
    }

    if (req.method === "POST") {
      const body = req.body ?? {};
      // Honeypot: real visitors never see or fill this field.
      if (clean(body.website, 200)) return res.status(200).json({ ok: true });

      const image = typeof body.image === "string" ? body.image : "";
      const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(image);
      if (!m) return res.status(400).json({ error: "Missing image" });
      const jpeg = Buffer.from(m[1], "base64");
      if (jpeg.length < 1000 || jpeg.length > MAX_IMAGE_BYTES || jpeg[0] !== 0xff || jpeg[1] !== 0xd8) {
        return res.status(400).json({ error: "Bad image" });
      }

      const piece = body.piece ?? {};
      const pieceSrc = clean(piece.src, 600);
      if (!allowedPieceSrc(pieceSrc)) return res.status(400).json({ error: "Unknown piece" });

      const ipHash = hashIp(clientIp(req));
      if ((await recentCount(ipHash)) >= MAX_PER_HOUR) {
        return res.status(429).json({ error: "Too many submissions, try again later" });
      }

      const fx = body.fx ?? {};
      const entry = await createEntry({
        name: clean(body.name, 40) || "anon",
        note: clean(body.note, 280),
        jpeg,
        piece: { title: clean(piece.title, 120), src: pieceSrc, link: clean(piece.link, 600) },
        fx: {
          mode: clean(fx.mode, 12) || "off",
          wet: Math.min(1, Math.max(0, Number(fx.wet) || 0)),
          amount: Math.min(1, Math.max(0, Number(fx.amount) || 0)),
        },
        ipHash,
      });
      return res.status(201).json({ ok: true, id: entry.id });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).end();
  } catch (err) {
    console.error("[api/guestbook]", err);
    return res.status(500).json({ error: "Server error" });
  }
}
