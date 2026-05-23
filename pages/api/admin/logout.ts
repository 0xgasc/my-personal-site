import type { NextApiRequest, NextApiResponse } from "next";
import { clearSessionCookie } from "@/lib/admin/sessionAuth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  clearSessionCookie(res);
  res.status(200).json({ ok: true });
}
