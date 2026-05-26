-- ════════════════════════════════════════════════════════════════
-- MIGRATION: my-personal-site → offset-shared (schema: personal_site)
--
-- Run on: offset-shared Supabase project
-- Dashboard: https://supabase.com/dashboard/project/cbvuqtnagrhplwwcmmhq
-- Use the SQL Editor → paste this entire file → Run
-- ════════════════════════════════════════════════════════════════

create schema if not exists personal_site;

-- ─── site_settings ──────────────────────────────────────────────
create table if not exists personal_site.site_settings (
  id text primary key default 'default',
  master_fx_enabled boolean not null default true,
  default_theme text not null default 'auto',
  rotation_mode text not null default 'single',
  rotation_interval_sec integer not null default 30,
  updated_at timestamptz not null default now()
);

insert into personal_site.site_settings (id) values ('default')
on conflict (id) do nothing;

-- ─── scenes ─────────────────────────────────────────────────────
create table if not exists personal_site.scenes (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Untitled scene',
  sort_order integer not null default 0,
  is_public boolean not null default false,
  video_url text,
  video_opacity numeric not null default 0.5,
  video_blur numeric not null default 0,
  fx_mode text not null default 'off',
  fx_params jsonb not null default '{}'::jsonb,
  fx_wet numeric not null default 0.85,
  hover_enabled boolean not null default false,
  hover_effect text not null default 'invert',
  hover_radius numeric not null default 0.2,
  hover_intensity numeric not null default 0.8,
  theme_override text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists scenes_public_sort_idx
  on personal_site.scenes (is_public, sort_order);

-- ─── trigger function (schema-scoped) ───────────────────────────
create or replace function personal_site.bump_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists scenes_updated_at on personal_site.scenes;
create trigger scenes_updated_at
  before update on personal_site.scenes
  for each row execute function personal_site.bump_updated_at();

drop trigger if exists settings_updated_at on personal_site.site_settings;
create trigger settings_updated_at
  before update on personal_site.site_settings
  for each row execute function personal_site.bump_updated_at();

-- ─── RLS ────────────────────────────────────────────────────────
alter table personal_site.site_settings enable row level security;
alter table personal_site.scenes enable row level security;

drop policy if exists settings_read_all on personal_site.site_settings;
create policy settings_read_all on personal_site.site_settings
  for select using (true);

drop policy if exists scenes_read_public on personal_site.scenes;
create policy scenes_read_public on personal_site.scenes
  for select using (is_public = true);

-- ─── Grant anon/authenticated/service_role usage on schema ──────
grant usage on schema personal_site to anon, authenticated, service_role;
grant select on personal_site.scenes, personal_site.site_settings to anon, authenticated;
grant all on personal_site.scenes, personal_site.site_settings to service_role;

-- ─── Expose schema via PostgREST ────────────────────────────────
-- IMPORTANT: After running this SQL, go to:
--   Dashboard → Project Settings → API → Exposed schemas
-- And add `personal_site` to the comma-separated list.
-- The Supabase REST API only exposes whitelisted schemas.

-- ════════════════════════════════════════════════════════════════
-- DATA MIGRATION (run AFTER above schema is created)
-- ════════════════════════════════════════════════════════════════
-- The data lives in the OLD personal-site Supabase project.
-- To copy it over, run this from your terminal:
--
--   pg_dump \
--     --data-only \
--     --schema=public \
--     --table=public.scenes \
--     --table=public.site_settings \
--     "postgresql://postgres.paslavsejelajxaigiky:<OLD_PASSWORD>@aws-0-us-east-1.pooler.supabase.com:6543/postgres" \
--     | sed 's/public\./personal_site\./g' \
--     | psql \
--     "postgresql://postgres.cbvuqtnagrhplwwcmmhq:<NEW_PASSWORD>@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
--
-- Replace <OLD_PASSWORD> with the personal-site DB password,
-- and <NEW_PASSWORD> with the offset-shared DB password
-- (just shown to you in chat — save it in 1Password).

-- ─── portfolio_items (added 2026-05-26) ─────────────────────────
create table if not exists personal_site.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('project', 'stretch_study', 'music')),
  title text not null default '',
  description text not null default '',
  src text not null default '',
  link text not null default '',
  sort_order int not null default 0,
  published bool not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

grant select on personal_site.portfolio_items to anon, authenticated;
grant all on personal_site.portfolio_items to service_role;
