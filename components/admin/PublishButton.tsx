"use client";

import { useState } from "react";

export default function PublishButton() {
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function publish() {
    if (!confirm("Push local scenes to prod (Supabase)? Remote scenes not in your local file will be deleted.")) {
      return;
    }
    setPublishing(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/publish", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Publish failed");
      setResult(`Published ${json.published} · removed ${json.removed}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {result && <span className="text-xs text-green-400">{result}</span>}
      {error && <span className="text-xs text-red-400">{error}</span>}
      <button
        onClick={publish}
        disabled={publishing}
        className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium disabled:opacity-50"
        title="Push local scenes file to production Supabase"
      >
        {publishing ? "Publishing…" : "↑ Publish to prod"}
      </button>
    </div>
  );
}
