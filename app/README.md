# FitBite App (Expo / React Native)

The mobile client. Expo SDK 56, TypeScript, expo-router (file-based routes in `src/app`),
TanStack Query + supabase-js, responsive for phones and tablets.

## Setup

```powershell
cd app
copy .env.example .env   # then fill in the values
npm install              # if node_modules isn't present
```

`.env` (only `EXPO_PUBLIC_*` reach the bundle — all safe to ship):

- `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` — from your Supabase project
- `EXPO_PUBLIC_API_URL` — the FastAPI base URL. On a physical device use your machine's LAN IP
  (e.g. `http://192.168.1.20:8000`), not `localhost`.

## Run

```powershell
npx expo start          # then press i (iOS sim) / a (Android emulator), or scan the QR in Expo Go
```

The FastAPI service must be running for onboarding (`/targets`) and scanning (`/scan`).

## Layout

```
src/
  app/            expo-router routes
    (auth)/       sign-in, sign-up
    (onboarding)/ profile, goal
    (tabs)/       today, scanner, settings (+ history/progress/saved "coming soon")
    scan/result   recommendation result screen
  components/     ScreenContainer, Card, Button, MacroRing, MacroBar, DishCard, Pill, ...
  features/       auth, profile, today, scan, onboarding (hooks + stores)
  lib/            supabase client, api fetch, query client
  theme/          design tokens (tokens.json) + useResponsive
  types/          API types mirroring the FastAPI Pydantic models
```

## Verify (without a device)

```powershell
npx tsc --noEmit                         # type check
npx expo export --platform android       # full Metro bundle (catches resolution errors)
```
