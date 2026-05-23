import crypto from "node:crypto";
import type { NextApiRequest, NextApiResponse, GetServerSidePropsContext } from "next";

const COOKIE_NAME = "admin_session";
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string {
  const s = process.env.ADMIN_COOKIE_SECRET;
  if (!s) throw new Error("ADMIN_COOKIE_SECRET missing");
  return s;
}

function getPassword(): string {
  const p = process.env.ADMIN_PASSWORD;
  if (!p) throw new Error("ADMIN_PASSWORD missing");
  return p;
}

/**
 * Stateless session token: HMAC-SHA256(ADMIN_COOKIE_SECRET, ADMIN_PASSWORD).
 * Rotating either invalidates all sessions instantly.
 */
function expectedToken(): string {
  return crypto.createHmac("sha256", getSecret()).update(getPassword()).digest("hex");
}

export function verifyPassword(input: string): boolean {
  if (typeof input !== "string" || !input) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(getPassword());
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k) out[k] = decodeURIComponent(v.join("="));
  }
  return out;
}

export function isAuthed(req: NextApiRequest | GetServerSidePropsContext["req"]): boolean {
  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_COOKIE_SECRET) return false;
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[COOKIE_NAME];
  if (!token) return false;
  const expected = expectedToken();
  if (token.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function setSessionCookie(res: NextApiResponse): void {
  const token = expectedToken();
  const isProd = process.env.NODE_ENV === "production";
  const parts = [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${COOKIE_MAX_AGE_SEC}`,
  ];
  if (isProd) parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}

export function clearSessionCookie(res: NextApiResponse): void {
  const isProd = process.env.NODE_ENV === "production";
  const parts = [`${COOKIE_NAME}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (isProd) parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}

export function requireAdmin(
  req: NextApiRequest | GetServerSidePropsContext["req"],
  res: NextApiResponse
): boolean {
  if (isAuthed(req)) return true;
  res.status(401).json({ error: "Unauthorized" });
  return false;
}
