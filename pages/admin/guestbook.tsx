import Head from "next/head";
import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { withAdminAuth } from "@/lib/admin/withAdminAuth";
import { listEntries, type GuestbookEntry } from "@/lib/guestbook/store";

interface Props {
  initialEntries: GuestbookEntry[];
}

export const getServerSideProps = withAdminAuth<Props>(async () => {
  try {
    const initialEntries = await listEntries(true);
    return { props: { initialEntries: JSON.parse(JSON.stringify(initialEntries)) } };
  } catch (err) {
    console.error("[admin/guestbook gsp]", err);
    return { props: { initialEntries: [] } };
  }
});

const ago = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (!isFinite(s)) return "";
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} d ago`;
};

export default function AdminGuestbook({ initialEntries }: Props) {
  const [entries, setEntries] = useState(initialEntries);
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending" | "approved" | "all">("pending");

  async function setApproved(id: string, approved: boolean) {
    setBusy(id);
    const res = await fetch(`/api/admin/guestbook?id=${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ approved }),
    });
    if (res.ok) setEntries((es) => es.map((e) => (e.id === id ? { ...e, approved } : e)));
    setBusy(null);
  }

  async function remove(id: string) {
    if (!confirm("Delete this entry and its image?")) return;
    setBusy(id);
    const res = await fetch(`/api/admin/guestbook?id=${id}`, { method: "DELETE" });
    if (res.ok) setEntries((es) => es.filter((e) => e.id !== id));
    setBusy(null);
  }

  const pending = entries.filter((e) => !e.approved).length;
  const shown = entries.filter((e) => (filter === "all" ? true : filter === "pending" ? !e.approved : e.approved));

  return (
    <>
      <Head>
        <title>Admin · Guestbook</title>
      </Head>
      <AdminLayout>
        <div className="flex items-baseline gap-4 mb-6">
          <h1 className="text-xl font-semibold">Guestbook</h1>
          <div className="flex gap-1 text-sm">
            {(["pending", "approved", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full ${filter === f ? "bg-white text-gray-900" : "text-gray-400 hover:text-white"}`}
              >
                {f}
                {f === "pending" && pending > 0 ? ` (${pending})` : ""}
              </button>
            ))}
          </div>
          <a href="/guestbook" target="_blank" rel="noreferrer" className="ml-auto text-sm text-gray-400 hover:text-white">
            View page ↗
          </a>
        </div>

        {shown.length === 0 ? (
          <p className="text-gray-400 text-sm">Nothing here.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {shown.map((e) => (
              <div key={e.id} className="rounded-lg overflow-hidden border border-gray-800 bg-gray-900">
                <a href={e.imageUrl} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={e.imageUrl} alt="" className="w-full aspect-square object-cover" />
                </a>
                <div className="p-3 text-sm space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium">{e.name}</span>
                    <span className="text-gray-500 text-xs">{ago(e.createdAt)}</span>
                    <span className={`ml-auto text-xs ${e.approved ? "text-green-400" : "text-yellow-400"}`}>
                      {e.approved ? "live" : "pending"}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs">
                    remix of {e.piece.title || e.piece.src} · {e.fx.mode} · wet {Math.round(e.fx.wet * 100)}%
                  </p>
                  {e.note && <p className="text-gray-300">{e.note}</p>}
                  <div className="flex gap-2 pt-2">
                    {e.approved ? (
                      <button disabled={busy === e.id} onClick={() => setApproved(e.id, false)} className="px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 disabled:opacity-50">
                        Hide
                      </button>
                    ) : (
                      <button disabled={busy === e.id} onClick={() => setApproved(e.id, true)} className="px-3 py-1.5 rounded-md bg-white text-gray-900 font-medium hover:bg-gray-200 disabled:opacity-50">
                        Approve
                      </button>
                    )}
                    <button disabled={busy === e.id} onClick={() => remove(e.id)} className="ml-auto px-3 py-1.5 rounded-md text-red-400 hover:bg-red-950 disabled:opacity-50">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminLayout>
    </>
  );
}
