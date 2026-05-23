import Head from "next/head";
import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import StashUpload from "@/components/admin/StashUpload";
import { withAdminAuth } from "@/lib/admin/withAdminAuth";

export const getServerSideProps = withAdminAuth();

/**
 * Standalone clip uploader. Skips the scene-editor flow entirely —
 * upload a video → copy the Irys URL → paste to me to wire as a
 * background. Doesn't require any storage/DB writes.
 */
export default function AdminUploadPage() {
  const [urls, setUrls] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  function copy(text: string) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(text);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  function removeUrl(target: string) {
    setUrls((cur) => cur.filter((u) => u !== target));
  }

  return (
    <>
      <Head>
        <title>Admin · Upload clip</title>
      </Head>
      <AdminLayout>
        <h1 className="text-2xl font-semibold mb-4">Upload background clip</h1>
        <p className="text-gray-400 text-sm mb-8 max-w-xl">
          Drop a short video here. It auto-compresses to ~720p VP9 and uploads
          to Stash (permanent Arweave storage via Irys). When done you get a
          URL you can paste anywhere — for the site background, set them as the
          <code className="font-mono text-amber-400 mx-1">NEXT_PUBLIC_BG_CLIPS</code>
          env var (comma-separated).
        </p>

        <div className="max-w-xl space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <StashUpload
              currentUrl={null}
              onUploaded={(url) => setUrls((cur) => (cur.includes(url) ? cur : [...cur, url]))}
              onClear={() => {}}
            />
          </div>

          {urls.length > 0 && (
            <div>
              <h2 className="text-sm uppercase tracking-widest text-gray-500 mb-3">
                Uploaded ({urls.length})
              </h2>
              <ul className="space-y-2">
                {urls.map((u) => (
                  <li
                    key={u}
                    className="bg-gray-900 border border-gray-800 rounded-md p-3 flex items-center gap-3"
                  >
                    <a
                      href={u}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs text-gray-300 hover:text-white truncate flex-1"
                    >
                      {u}
                    </a>
                    <button
                      onClick={() => copy(u)}
                      className="text-xs px-3 py-1 rounded bg-gray-800 border border-gray-700 hover:border-gray-500"
                    >
                      {copied === u ? "✓ copied" : "copy"}
                    </button>
                    <button
                      onClick={() => removeUrl(u)}
                      className="text-xs px-2 py-1 rounded bg-red-900/30 text-red-300 border border-red-900 hover:border-red-700"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-4 bg-gray-900 border border-gray-800 rounded-md p-3">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                  Env var value (paste to vercel)
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-amber-400 break-all flex-1">
                    {urls.join(",")}
                  </code>
                  <button
                    onClick={() => copy(urls.join(","))}
                    className="text-xs px-3 py-1 rounded bg-gray-800 border border-gray-700 hover:border-gray-500 whitespace-nowrap"
                  >
                    copy all
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}
