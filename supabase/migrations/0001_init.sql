-- FitBite — initial schema (vertical slice)
-- Run in the Supabase SQL editor, or via `supabase db push` with the CLI.
-- Tables: profiles, scans, food_log. All owner-only via RLS on auth.uid().

-- ============================ profiles ============================
-- 1:1 with auth.users. Onboarding inputs + computed targets so the client and
-- the Today tab can read without recomputing.
create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  gender            text not null check (gender in ('male','female')),
  age               int  not null check (age between 13 and 100),
  height_cm         numeric not null check (height_cm > 0),
  current_weight_kg numeric not null check (current_weight_kg > 0),
  target_weight_kg  numeric,
  activity_level    text not null check (activity_level in
                       ('sedentary','light','moderate','active','very_active')),
  goal              text not null check (goal in
                       ('lose_weight','gain_weight','eat_healthier','high_protein')),
  strictness        text not null default 'balanced'
                       check (strictness in ('relaxed','balanced','strict')),
  dietary_prefs     text[] not null default '{}',   -- halal, vegetarian, vegan, ...
  allergies         text[] not null default '{}',
  calorie_target    int  not null,
  protein_target_g  int  not null,
  fibre_target_g    int  not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ============================ scans ============================
-- One row per scan. The full ScanResult is stored as jsonb for the slice
-- (shape iterates fast; normalize into scan_dishes later for History/Progress).
create table if not exists public.scans (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  restaurant_name text,
  source          text not null check (source in ('photo','upload','text')),
  image_path      text,                              -- path in the menu-scans bucket
  result          jsonb not null,
  created_at      timestamptz not null default now()
);
create index if not exists scans_user_created_idx on public.scans (user_id, created_at desc);

-- ============================ food_log ============================
-- The "Add to Today" tracker source. log_date is the CLIENT's local date
-- (passed explicitly on insert) so the day boundary matches the user's timezone.
create table if not exists public.food_log (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  logged_at      timestamptz not null default now(),   -- UTC instant
  log_date       date not null,                         -- client local day key
  name           text not null,
  calories       int  not null,
  protein_g      int  not null,
  fibre_g        int  not null,
  source_scan_id uuid references public.scans(id) on delete set null,
  modifications  text[] not null default '{}'
);
create index if not exists food_log_user_date_idx on public.food_log (user_id, log_date);

-- ============================ updated_at trigger ============================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================ Row-Level Security ============================
alter table public.profiles enable row level security;
alter table public.scans    enable row level security;
alter table public.food_log enable row level security;

-- profiles: owner-only
drop policy if exists "own profile select" on public.profiles;
create policy "own profile select" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "own profile insert" on public.profiles;
create policy "own profile insert" on public.profiles
  for insert with check (auth.uid() = id);
drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- scans: owner-only (the FastAPI service writes with the service-role key, which
-- bypasses RLS — it MUST set user_id from the verified JWT, never the request body).
drop policy if exists "own scans select" on public.scans;
create policy "own scans select" on public.scans
  for select using (auth.uid() = user_id);
drop policy if exists "own scans insert" on public.scans;
create policy "own scans insert" on public.scans
  for insert with check (auth.uid() = user_id);

-- food_log: owner-only
drop policy if exists "own food select" on public.food_log;
create policy "own food select" on public.food_log
  for select using (auth.uid() = user_id);
drop policy if exists "own food insert" on public.food_log;
create policy "own food insert" on public.food_log
  for insert with check (auth.uid() = user_id);
drop policy if exists "own food delete" on public.food_log;
create policy "own food delete" on public.food_log
  for delete using (auth.uid() = user_id);

-- ============================ Storage: private menu-scans ============================
insert into storage.buckets (id, name, public)
values ('menu-scans', 'menu-scans', false)
on conflict (id) do nothing;

-- objects are stored at {user_id}/{scan_id}.jpg — first path segment must be the owner
drop policy if exists "own menu-scans read" on storage.objects;
create policy "own menu-scans read" on storage.objects
  for select using (
    bucket_id = 'menu-scans' and (storage.foldername(name))[1] = auth.uid()::text
  );
drop policy if exists "own menu-scans write" on storage.objects;
create policy "own menu-scans write" on storage.objects
  for insert with check (
    bucket_id = 'menu-scans' and (storage.foldername(name))[1] = auth.uid()::text
  );
