import type { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "node:stream";

/**
 * Streams a remote video through the same origin as the page so WebGL can
 * sample it as a texture without tainting. Required because Chromium often
 * fails the CORS handshake on multi-hop redirects + range requests, even
 * when the upstream sends correct headers.
 *
 * Only allow-listed hosts to avoid SSRF / open-proxy abuse.
 */

const ALLOWED_HOSTS = [
  /^https:\/\/devnet\.irys\.xyz\//,
  /^https:\/\/[a-z0-9-]+\.devnet-1\.datasprite-cdn\.com\//,
  /^https:\/\/arweave\.net\//,
  /^https:\/\/[a-z0-9-]+\.arweave\.net\//,
];

export const config = {
  api: { responseLimit: false, bodyParser: false },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const target = typeof req.query.url === "string" ? req.query.url : null;
  if (!target) {
    res.status(400).end("Missing url");
    return;
  }
  if (!ALLOWED_HOSTS.some((re) => re.test(target))) {
    res.status(400).end("Disallowed host");
    return;
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    res.status(405).end();
    return;
  }

  const upstreamHeaders: Record<string, string> = {};
  if (req.headers.range) upstreamHeaders["Range"] = String(req.headers.range);
  if (req.headers["if-range"]) upstreamHeaders["If-Range"] = String(req.headers["if-range"]);
  if (req.headers["if-modified-since"]) {
    upstreamHeaders["If-Modified-Since"] = String(req.headers["if-modified-since"]);
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers: upstreamHeaders,
      redirect: "follow",
    });
  } catch (err) {
    console.error("[/api/video] fetch failed:", err);
    res.status(502).end("Upstream fetch failed");
    return;
  }

  // Forward streaming-relevant headers.
  const passthrough = [
    "content-type",
    "content-length",
    "content-range",
    "accept-ranges",
    "last-modified",
    "etag",
    "cache-control",
  ];
  for (const h of passthrough) {
    const v = upstream.headers.get(h);
    if (v) res.setHeader(h, v);
  }
  res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
  res.status(upstream.status);

  if (req.method === "HEAD" || !upstream.body) {
    res.end();
    return;
  }

  // Pipe Web ReadableStream → Node response.
  const nodeStream = Readable.fromWeb(upstream.body as never);
  nodeStream.on("error", (err) => {
    console.error("[/api/video] stream error:", err);
    res.end();
  });
  nodeStream.pipe(res);
}
