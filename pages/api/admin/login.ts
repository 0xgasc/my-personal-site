import type { NextApiRequest, NextApiResponse } from "next";
import { setSessionCookie, verifyPassword } from "@/lib/admin/sessionAuth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const password = (req.body && typeof req.body === "object" ? req.body.password : null) as
    | string
    | null;
  if (!verifyPassword(password ?? "")) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }
  setSessionCookie(res);
  res.status(200).json({ ok: true });
}
