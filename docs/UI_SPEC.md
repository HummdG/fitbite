# FitBite — UI Spec

This document mirrors the design mockups in this folder and maps every screen to
the Expo (React Native) implementation under `app/src/app`. It is the written
companion to the images:

- **Logo:** [`Logo V2.png`](./Logo%20V2.png) — the cloche mark + “FitBite” wordmark.
- **Onboarding:** [`Oboarding V2.png`](./Oboarding%20V2.png) — Welcome + 4 steps.
- **App:** [`FitBite UI V5.png`](./FitBite%20UI%20V5.png) — the 8 core screens.

![App screens](./FitBite%20UI%20V5.png)

---

## Brand system

| Token | Value | Use |
| --- | --- | --- |
| Pink | `#F13A94` | primary actions, calories |
| Candy pink | `#FA62AB` | carbs |
| Purple | `#6D21B2` | protein, secondary accents |
| Berry | `#BA30B1` | fat |
| Background | `#FFF7FB` | app background |
| Card | `#FFFFFF` | surfaces |

Source of truth: `app/src/theme/tokens.json` (`color.macro.*` added for the four
macros). Gradient header uses pink → candy → purple.

### Macros

The UI surfaces **Calories, Protein, Carbs and Fat** (matching the mockups).
Carbs and Fat were added end-to-end in this pass: Claude extracts them, they are
stored on `food_log`/`profiles`, and they appear on the rings, targets and item
details. Fibre is still tracked internally and feeds the deterministic Fit Score,
which is unchanged.

---

## Onboarding

![Onboarding](./Oboarding%20V2.png)

### 1 · Welcome — `app/src/app/welcome.tsx`
Cloche logo + wordmark, tagline “Find the **bite** that fits.”, supporting line,
a pink **Get started** button (→ Sign up) and **I already have an account** (→
Sign in). Unauthenticated users land here (`_layout.tsx` AuthGate).

### 2 · About you — `app/src/app/(onboarding)/profile.tsx`
Step bar (2/4). Sex chips, Age, Height, Current/Target weight, Activity-level
chips, Dietary-preference chips, Allergies. **Continue** → Your goal.

### 3 · Your goal — `app/src/app/(onboarding)/goal.tsx`
Step bar (3/4). Four selectable goal cards (Lose weight, Gain muscle, Eat
healthier, High protein) and a **How strict should we be?** segmented control
(Relaxed / Balanced / Strict). **Calculate my targets** calls the `/targets`
service and advances to step 4.

### 4 · Your targets — `app/src/app/(onboarding)/targets.tsx`
Step bar (4/4). Computed Calories / Protein / Carbs / Fat as tiles, then **Choose
what appears on your dashboard** (multi-select of the macro widgets). **Finish
setup** upserts the profile (targets + `dashboard_widgets`); the AuthGate then
routes to Today.

---

## App (bottom tabs: Today · Scan · Log · Progress · Profile)

Tab bar: `app/src/app/(tabs)/_layout.tsx` — line icons via `@expo/vector-icons`.

### 1 · Today — `app/src/app/(tabs)/today.tsx`
Gradient header with the date and a streak pill. A macro summary card (prominent
Calories ring + mini Protein/Carbs/Fat rings, driven by `dashboard_widgets`).
**Quick actions** (Scan a menu, Add food → manual-entry modal). **Today’s log**
rows with a thumbnail, macros, kcal and a delete action.

### 2 · Scan a menu — `app/src/app/(tabs)/scanner.tsx`
Three ways to scan: **Take a photo**, **Upload a screenshot** and **Search a
restaurant** (text). Photo/upload are resized client-side before the vision call.

### 3 · Menu results — `app/src/app/scan/result.tsx`
A ranked list of dishes. The best pick is highlighted; every row shows a
thumbnail, verdict pill, macro chips and a verdict-coloured fit score. Tapping a
row opens item details.

### 4 · Item details — `app/src/app/scan/item.tsx`
Large image placeholder, name, fit score + verdict, the four macro tiles, **About
this item** (description / why / ingredients), **Better swaps** (smart-order
modifications) and other good options. **Add to today** logs the dish.

### 5 · Log — `app/src/app/(tabs)/history.tsx`
Month calendar with dots on logged days; selecting a day lists what was eaten and
the day’s total kcal. Data via `useHistory`.

### 6 · Progress — `app/src/app/(tabs)/progress.tsx`
7 / 30 / 90-day segmented control, headline average daily calories, an SVG line
chart of the calorie trend, and daily-average macro tiles.

### 7 · Profile — `app/src/app/(tabs)/settings.tsx`
“Hey {name}” header with avatar, plan + daily-target summaries, **Dashboard
widgets** toggles (persisted to `profiles.dashboard_widgets`), a Units control and
**Sign out**.

---

## Thumbnails

Food imagery is intentionally left as empty, brand-tinted placeholders
(`components/Thumb.tsx`) for now — there is no per-dish image source yet.

## Component library

Reusable pieces live in `app/src/components` (barrel: `index.ts`): `Button`,
`Card`, `ChipGroup`, `SegmentedControl`, `SelectCard`, `OptionRow`, `Stepper`,
`MacroRing`, `MacroSummary`, `MacroStat`, `MacroChips`, `DishCard`, `Calendar`,
`LineChart`, `Thumb`, `Icon`, `GradientHeader`, `Field`, `Pill`,
`ScreenContainer`.
