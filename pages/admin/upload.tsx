import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/admin/AdminLayout";
import StashUpload from "@/components/admin/StashUpload";
import { withAdminAuth } from "@/lib/admin/withAdminAuth";
import type { Clip } from "@/lib/clips/types";

export const getServerSideProps = withAdminAuth();

/**
 * Upload a clip → creates a (private) clip row pointing at the new
 * Irys URL, then jumps to the editor so you can tune FX/start/etc.
 */
export default function AdminUploadPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onUploaded(url: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/clips", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          videoUrl: url,
          name: url.split("/").pop()?.slice(0, 24) ?? "untitled clip",
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error ?? `Save failed (${res.status})`);
      }
      const json = (await res.json()) as { clip: Clip };
      if (json.clip?.id) router.push(`/admin/clips/${json.clip.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "create clip failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Head>
        <title>Admin · Upload clip</title>
      </Head>
      <AdminLayout>
        <div className="max-w-2xl">
          <h1 className="text-2xl font-semibold mb-2">Upload a background clip</h1>
          <p className="text-gray-400 text-sm mb-8">
            Drop a video here. It auto-compresses to ~720p VP9 and uploads to
            Stash (permanent Arweave storage via Irys). When the URL lands I
            create a private clip row + jump you to the editor where you can
            tune FX, start mode, orientation, and mobile zoom — then flip it
            public.
          </p>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <StashUpload
              currentUrl={null}
              onUploaded={onUploaded}
              onClear={() => {}}
            />
            {busy && <p className="text-xs text-gray-500 mt-3">Creating clip…</p>}
            {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
          </div>

          <div className="mt-8">
            <Link href="/admin" className="text-sm text-amber-400 underline">
              ← back to clip library
            </Link>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
