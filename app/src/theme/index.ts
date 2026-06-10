// Brand system — single source of truth for FitBite's colours/spacing/radius.
// The app is the only consumer of design tokens, so they live here in the app.
import tokens from './tokens.json';

export const theme = tokens;
export type Theme = typeof tokens;

export type VerdictKey = keyof typeof tokens.verdict;

export const verdictColor = (verdict: string): string =>
  (tokens.verdict as Record<string, string>)[verdict] ?? tokens.color.textSecondary;

export const verdictLabel = (verdict: string): string =>
  ({
    great: 'Great choice',
    good_with_mods: 'Good with mods',
    calorie_dense: 'Calorie-dense',
    hard_to_track: 'Hard to track',
    not_ideal: 'Not ideal',
  } as Record<string, string>)[verdict] ?? verdict;
