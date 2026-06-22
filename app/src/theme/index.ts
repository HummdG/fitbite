// Brand system — single source of truth for FitBite's colours/spacing/radius.
// The app is the only consumer of design tokens, so they live here in the app.
import { Platform, ViewStyle } from 'react-native';
import tokens from './tokens.json';

export const theme = tokens;
export type Theme = typeof tokens;

export type VerdictKey = keyof typeof tokens.verdict;

/**
 * Maps a CSS-style fontWeight to the matching Poppins family. RN won't reliably
 * pick the right weight from `fontWeight` alone (especially on Android), so every
 * text style resolves to an explicit family. Used by the shared <Text> wrapper.
 */
export const font = (weight?: string | number): string => {
  switch (String(weight)) {
    case '500':
      return tokens.fontFamily.medium;
    case '600':
      return tokens.fontFamily.semibold;
    case '700':
    case '800':
    case '900':
    case 'bold':
      return tokens.fontFamily.bold;
    default:
      return tokens.fontFamily.regular;
  }
};

/** Append an 8-bit alpha (0–255) as hex to a #RRGGBB colour, e.g. tint('#F13A94', 26). */
export const withAlpha = (hex: string, alpha: number): string =>
  `${hex}${Math.max(0, Math.min(255, Math.round(alpha))).toString(16).padStart(2, '0').toUpperCase()}`;

type ShadowToken = { color: string; opacity: number; radius: number; offsetY: number };

/** Converts a shadow token into a cross-platform RN style object. */
export const shadow = (token: ShadowToken): ViewStyle =>
  (Platform.select({
    ios: {
      shadowColor: token.color,
      shadowOpacity: token.opacity,
      shadowRadius: token.radius,
      shadowOffset: { width: 0, height: token.offsetY },
    },
    android: { elevation: Math.round(token.radius / 3) },
    default: {},
  }) ?? {}) as ViewStyle;

export const cardShadow = () => shadow(tokens.shadow.card);
export const softShadow = () => shadow(tokens.shadow.soft);
export const keyShadow = () => shadow(tokens.shadow.key);

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
