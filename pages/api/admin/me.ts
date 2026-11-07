import type { NextApiRequest, NextApiResponse } from "next";
import { isAuthed } from "@/lib/admin/sessionAuth";

/** Lets public pages know whether to show edit controls. The cookie itself is HttpOnly. */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ admin: isAuthed(req) });
}
