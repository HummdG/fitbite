-- FitBite — add Carbs + Fat macros and dashboard widget preferences.
-- Carbs/fat are informational macros surfaced in the redesigned UI (Today rings,
-- onboarding targets, item details). They are NOT part of the deterministic Fit
-- Score. dashboard_widgets drives which macros the Today dashboard shows.
-- Run in the Supabase SQL editor, or via `supabase db push` with the CLI.

-- ============================ profiles ============================
alter table public.profiles
  add column if not exists carbs_target_g int not null default 0,
  add column if not exists fat_target_g   int not null default 0,
  add column if not exists dashboard_widgets text[] not null
    default '{calories,protein,carbs,fat}';

-- ============================ food_log ============================
alter table public.food_log
  add column if not exists carbs_g int not null default 0,
  add column if not exists fat_g   int not null default 0;

-- No RLS/trigger changes: existing owner-only policies cover the new columns.
