"use client";

import Link from "next/link";
import { useRouter } from "next/router";

interface AdminLayoutProps {
  children: React.ReactNode;
  storeMode?: "local" | "remote";
  /** Reserve right padding for the FX panel (320px). Used by scene editor. */
  reserveFxGutter?: boolean;
  /** Constrain content width. Default true on list/settings pages, false on editor. */
  constrainWidth?: boolean;
}

const navItems = [
  { href: "/admin", label: "Scenes" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/", label: "View site" },
];

export default function AdminLayout({
  children,
  storeMode,
  reserveFxGutter = false,
  constrainWidth = true,
}: AdminLayoutProps) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between sticky top-0 bg-gray-950/95 backdrop-blur z-30">
        <div className="flex items-center gap-6">
          <span className="font-mono text-sm tracking-widest uppercase">Admin</span>
          <nav className="flex gap-4 text-sm">
            {navItems.map((item) => {
              const active =
                item.href === "/admin"
                  ? router.pathname === "/admin"
                  : router.pathname.startsWith(item.href) && item.href !== "/";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-colors ${active ? "text-white" : "text-gray-400 hover:text-white"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          {storeMode && (
            <span
              className={`px-2 py-0.5 rounded text-xs font-mono uppercase ${
                storeMode === "local"
                  ? "bg-amber-900/30 text-amber-300 border border-amber-800"
                  : "bg-emerald-900/30 text-emerald-300 border border-emerald-800"
              }`}
              title={
                storeMode === "local"
                  ? "Editing local file. Use 'Publish to prod' to sync to Supabase."
                  : "Editing live production data."
              }
            >
              {storeMode}
            </span>
          )}
          <button
            onClick={logout}
            className="px-2 py-1 rounded border border-gray-700 hover:border-gray-500"
          >
            Sign out
          </button>
        </div>
      </header>
      <main
        className={`px-6 py-6 ${constrainWidth ? "max-w-6xl mx-auto" : ""}`}
        style={reserveFxGutter ? { paddingRight: 340 } : undefined}
      >
        {children}
      </main>
    </div>
  );
}
