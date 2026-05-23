-- ════════════════════════════════════════════════════════════════
-- my-personal-site — Supabase schema
-- Run this in Supabase SQL Editor (project → SQL Editor → New query)
-- ════════════════════════════════════════════════════════════════

-- ─── site_settings (single row) ─────────────────────────────────
create table if not exists public.site_settings (
  id text primary key default 'default',
  master_fx_enabled boolean not null default true,
  default_theme text not null default 'auto',  -- 'light' | 'dark' | 'auto'
  rotation_mode text not null default 'single', -- 'single' | 'sequential' | 'random'
  rotation_interval_sec integer not null default 30,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id) values ('default')
on conflict (id) do nothing;

-- ─── scenes ─────────────────────────────────────────────────────
create table if not exists public.scenes (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Untitled scene',
  sort_order integer not null default 0,
  is_public boolean not null default false,

  video_url text,
  video_opacity numeric not null default 0.5,
  video_blur numeric not null default 0,

  -- WebGL FX (single fragment shader, mode-driven). Modes:
  -- off | crt | vhs | dream | ascii | pixel | dither
  fx_mode text not null default 'off',
  fx_params jsonb not null default '{}'::jsonb,
  fx_wet numeric not null default 0.85,

  -- Universal mouse-hover effect, applied AFTER any mode FX.
  hover_enabled boolean not null default false,
  hover_effect text not null default 'invert', -- invert|pixelate|recolor|sharpen
  hover_radius numeric not null default 0.2,
  hover_intensity numeric not null default 0.8,

  theme_override text,  -- 'light' | 'dark' | null

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists scenes_public_sort_idx
  on public.scenes (is_public, sort_order);

-- ─── trigger: bump updated_at ───────────────────────────────────
create or replace function public.bump_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists scenes_updated_at on public.scenes;
create trigger scenes_updated_at
  before update on public.scenes
  for each row execute function public.bump_updated_at();

drop trigger if exists settings_updated_at on public.site_settings;
create trigger settings_updated_at
  before update on public.site_settings
  for each row execute function public.bump_updated_at();

-- ─── RLS ────────────────────────────────────────────────────────
alter table public.site_settings enable row level security;
alter table public.scenes enable row level security;

-- public can read settings + public scenes
drop policy if exists settings_read_all on public.site_settings;
create policy settings_read_all on public.site_settings
  for select using (true);

drop policy if exists scenes_read_public on public.scenes;
create policy scenes_read_public on public.scenes
  for select using (is_public = true);

-- writes are service-role only (admin API uses service-role key — RLS bypassed)
-- intentionally no INSERT/UPDATE/DELETE policies for anon/authed roles.
