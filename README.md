# FitBite

A restaurant menu scanner that helps you order the smartest meal for your goal.
Photograph or paste a menu → the app reads it, estimates each dish's calories /
protein / fibre, and ranks dishes by a weighted **Fit Score** tuned to your goal.

> Core promise: *"Go out to eat without ruining your progress."*

This repo is a **monorepo** containing three parts:

| Folder    | What it is                                                                 |
|-----------|----------------------------------------------------------------------------|
| `app/`    | Expo (React Native + TypeScript) client — phones & tablets, iOS & Android  |
| `service/`| Python **FastAPI** service — Claude vision extraction + Fit Score + targets |
| `shared/` | Design tokens + API contracts shared across the two                        |
| `docs/`   | Source concept + colour-scheme docs + logo                                 |

## Current scope — vertical slice

`login → profile/goal setup → scan menu → AI recommendations → "Add to Today" → Today tab`

Deferred for later: History, Progress, Saved Restaurants, manual food entry, monetization.
See `C:\Users\hummd\.claude\plans\effervescent-wobbling-harbor.md` for the full plan.

## Architecture at a glance

```
Expo app ──supabase-js──▶ Supabase (Auth · Postgres+RLS · Storage)
   │
   └──HTTPS (Bearer JWT)──▶ FastAPI ──▶ Anthropic Claude (vision)
                              │
                              └─ Claude EXTRACTS macros (ranges); Python SCORES (deterministic Fit Score)
```

The Anthropic key and Supabase service-role key live **only** on the FastAPI server.

## Getting started

- **Service:** see [`service/README.md`](service/README.md)
- **App:** see [`app/README.md`](app/README.md)

You will need a Supabase project and an Anthropic API key — copy each `.env.example`
to `.env` and fill in the values.
