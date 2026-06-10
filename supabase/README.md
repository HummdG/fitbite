# Supabase setup (FitBite)

The app uses Supabase for **Auth**, **Postgres (+ RLS)**, and **Storage**.

## 1. Create the project

1. Create a project at https://supabase.com (note the region close to your users).
2. From **Project Settings → API**, copy:
   - `Project URL` → `SUPABASE_URL` (service) and `EXPO_PUBLIC_SUPABASE_URL` (app)
   - `anon public` key → `EXPO_PUBLIC_SUPABASE_ANON_KEY` (app — safe to ship, RLS-gated)
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**service only**, never in the app)
3. From **Project Settings → API → JWT Settings**, copy the `JWT Secret` → `SUPABASE_JWT_SECRET` (service only).
4. (Dev) **Authentication → Providers → Email**: turn **Confirm email OFF** for a fast local loop. Turn it back ON for production.

## 2. Run the schema

Paste [`migrations/0001_init.sql`](migrations/0001_init.sql) into the **SQL Editor** and run it.
(Or, with the Supabase CLI: `supabase link` then `supabase db push`.)

## 3. Verify RLS (do this — it catches the #1 security mistake)

1. Create two users (Authentication → Users → Add user), call them A and B.
2. In the SQL Editor, run as user A (the editor lets you set the role/JWT claims, or
   test from the app): a `select * from food_log` must return **only A's rows**.
3. Insert a `food_log` row as A, then confirm B cannot see it. If B can, RLS is wrong —
   stop and fix before continuing.

> The FastAPI service writes `scans` with the **service-role key**, which **bypasses RLS**.
> That code path must always set `user_id` from the verified JWT subject, never from the
> request body. See `service/app/routers/scan.py`.

## Tables

| table      | purpose                                              |
|------------|------------------------------------------------------|
| `profiles` | 1:1 with `auth.users`; onboarding inputs + targets   |
| `scans`    | one row per scan; full result stored as `jsonb`      |
| `food_log` | the Today tracker; what the user "added to today"    |

Storage bucket `menu-scans` is **private**; objects live at `{user_id}/{scan_id}.jpg`.
