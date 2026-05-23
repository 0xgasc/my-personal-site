"use client";

import { useRef, useState } from "react";
import * as tus from "tus-js-client";
import { compressVideo } from "@/lib/video/compress";

const STASH_SERVER =
  process.env.NEXT_PUBLIC_STASH_SERVER ?? "https://stash-production-47fc.up.railway.app";
const CHUNK_SIZE = 5 * 1024 * 1024;
const MB = 1024 * 1024;
const COMPRESS_THRESHOLD = 10 * MB;

interface StashUploadProps {
  currentUrl: string | null;
  onUploaded: (url: string) => void;
  onClear: () => void;
  accept?: string;
}

export default function StashUpload({
  currentUrl,
  onUploaded,
  onClear,
  accept = "video/*",
}: StashUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<string>("");

  function pickFile() {
    inputRef.current?.click();
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const original = e.target.files?.[0];
    if (!original) return;
    setError(null);
    setUploading(true);
    setProgress(0);
    setPhase("starting");
    console.groupCollapsed(`[stash] upload start: ${original.name} (${original.size} bytes)`);
    console.log("endpoint:", `${STASH_SERVER}/tus-upload`);
    console.log("type:", original.type);

    // Always compress to a web-friendly preset (720p VP9, ~1.5 Mbps, audio
    // stripped) before uploading — keeps streaming fast and predictable.
    // Small clips (< 10MB) are passed through as-is.
    let toUpload: File = original;
    if (original.size > COMPRESS_THRESHOLD && accept.startsWith("video")) {
      try {
        setPhase("preparing transcoder…");
        const blob = await compressVideo(original, {
          onSettings(s) {
            console.log("[stash] compress target:", s);
            setPhase(
              `transcoding to ${s.width}×${s.height} ${s.mimeType.includes("vp9") ? "VP9" : "WebM"}…`
            );
          },
          onProgress(pct) {
            setProgress(Math.round(pct * 100));
            setPhase(`transcoding ${Math.round(pct * 100)}%`);
          },
        });
        const newName = original.name.replace(/\.[^.]+$/, "") + ".webm";
        toUpload = new File([blob], newName, { type: blob.type });
        console.log(
          `[stash] compressed: ${original.size}B → ${toUpload.size}B (${(
            (toUpload.size / original.size) *
            100
          ).toFixed(1)}%)`
        );
        setProgress(0);
      } catch (err) {
        console.error("[stash] compress failed, uploading original:", err);
        setPhase("compression failed — uploading original…");
        // Fall through to upload the original file. Often this means the source
        // codec wasn't decodable (e.g. HEVC) — user gets a working URL anyway.
      }
    }

    await new Promise<void>((resolve) => {
      const file = toUpload;
      const upload = new tus.Upload(file, {
        endpoint: `${STASH_SERVER}/tus-upload`,
        chunkSize: CHUNK_SIZE,
        retryDelays: [0, 1000, 3000, 5000],
        metadata: {
          filename: file.name,
          filetype: file.type,
        },
        onError(err) {
          console.error("[stash] tus error:", err);
          console.groupEnd();
          setError(err.message || "Upload failed");
          setPhase("");
          setUploading(false);
          resolve();
        },
        onProgress(bytesUploaded, bytesTotal) {
          const pct = bytesTotal ? Math.round((bytesUploaded / bytesTotal) * 100) : 0;
          setProgress(pct);
          setPhase(`uploading ${pct}%`);
        },
        async onSuccess() {
          try {
            const url = (upload.url ?? "").toString();
            console.log("[stash] tus uploaded:", url);
            const uploadId = url.split("/").pop();
            if (!uploadId) throw new Error("No upload id from TUS");
            setPhase("finalizing on Arweave…");
            const res = await fetch(`${STASH_SERVER}/tus-upload/complete`, {
              method: "POST",
              credentials: "include",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ uploadId, originalFilename: file.name }),
            });
            console.log("[stash] complete status:", res.status);
            if (!res.ok) {
              const txt = await res.text();
              throw new Error(`Complete failed (${res.status}): ${txt.slice(0, 200)}`);
            }
            const json = (await res.json()) as { url: string };
            console.log("[stash] permanent URL:", json.url);
            console.groupEnd();
            setPhase("");
            onUploaded(json.url);
          } catch (err) {
            console.error("[stash] complete error:", err);
            console.groupEnd();
            setError(err instanceof Error ? err.message : "Complete failed");
            setPhase("");
          } finally {
            setUploading(false);
            resolve();
          }
        },
      });
      upload.start();
    });

    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      {currentUrl ? (
        <div className="flex items-center gap-2">
          <a
            href={currentUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono text-gray-400 hover:text-white truncate flex-1"
          >
            {currentUrl}
          </a>
          <button
            onClick={pickFile}
            disabled={uploading}
            className="px-2 py-1 text-xs rounded bg-gray-800 border border-gray-700 hover:border-gray-500 disabled:opacity-50"
          >
            replace
          </button>
          <button
            onClick={onClear}
            disabled={uploading}
            className="px-2 py-1 text-xs rounded bg-red-900/30 text-red-300 border border-red-900 hover:border-red-700 disabled:opacity-50"
          >
            remove
          </button>
        </div>
      ) : (
        <button
          onClick={pickFile}
          disabled={uploading}
          className="w-full py-3 rounded border border-dashed border-gray-700 hover:border-gray-500 text-sm text-gray-400 disabled:opacity-50"
        >
          {uploading
            ? phase || `Uploading… ${progress}%`
            : "Click to upload video — auto-compresses to 720p"}
        </button>
      )}
      {uploading && (
        <>
          <div className="h-1 bg-gray-800 rounded overflow-hidden">
            <div
              className="h-full bg-white transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          {phase && (
            <p className="text-xs text-gray-400 font-mono">{phase}</p>
          )}
        </>
      )}
      {error && <p className="text-xs text-red-400 font-mono break-all">{error}</p>}
    </div>
  );
}
