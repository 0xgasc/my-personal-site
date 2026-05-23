import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client. Server-only. Bypasses RLS — never expose to the browser.
 *
 * Schema selection: defaults to `public`. Set SUPABASE_SCHEMA=personal_site
 * to route queries to the offset-shared project's personal_site schema.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase admin client missing env vars");
  }
  const schema = process.env.SUPABASE_SCHEMA;
  return createClient(url, key, {
    ...(schema ? { db: { schema } } : {}),
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
