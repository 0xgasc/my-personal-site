import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ?? `Login failed (${res.status})`);
      }
      const next = typeof router.query.next === "string" ? router.query.next : "/admin";
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Admin · Sign in</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100 p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-sm bg-gray-800 rounded-lg p-6 shadow-lg space-y-4">
          <div>
            <h1 className="text-xl font-semibold">Admin sign-in</h1>
            <p className="text-sm text-gray-400 mt-1">Enter the admin password.</p>
          </div>
          <input
            type="password"
            autoFocus
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-3 py-2 rounded-md bg-gray-900 border border-gray-700 focus:outline-none focus:border-gray-400"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 rounded-md bg-white text-gray-900 font-medium disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>
      </div>
    </>
  );
}
