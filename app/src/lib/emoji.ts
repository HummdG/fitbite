import type { MacroKey } from '@/types/api';

/**
 * Emoji used on the dashboard dials, profile goals and onboarding options.
 * Sourced directly from the V1 feedback: calories=fire, protein=meat,
 * fibre=leaf, carbs=bread, fat=droplet, steps=footprints, water=cup.
 *
 * Emoji render from the platform colour-emoji font, so they intentionally are
 * NOT routed through the Plus Jakarta family — render them in a plain <Text>.
 */
export const MACRO_EMOJI: Record<MacroKey, string> = {
  calories: '🔥',
  protein: '🥩',
  fibre: '🍃',
  carbs: '🍞',
  fat: '💧',
};

/** Macro emoji plus the activity widgets that aren't macros (steps / water). */
export const WIDGET_EMOJI: Record<string, string> = {
  ...MACRO_EMOJI,
  steps: '👣',
  water: '🥤',
  weight: '⚖️',
};

/** Emoji for the onboarding goal cards. */
export const GOAL_EMOJI: Record<string, string> = {
  lose_weight: '📉',
  gain_weight: '💪',
  eat_healthier: '🥗',
  high_protein: '🍗',
};

/** Emoji for the onboarding strictness segmented control. */
export const STRICTNESS_EMOJI: Record<string, string> = {
  relaxed: '😌',
  balanced: '⚖️',
  strict: '🎯',
};

/** Emoji for the onboarding gender + activity choices. */
export const GENDER_EMOJI: Record<string, string> = { female: '👩', male: '👨' };
export const ACTIVITY_EMOJI: Record<string, string> = {
  sedentary: '🪑',
  light: '🚶',
  moderate: '🚴',
  active: '🏃',
  very_active: '🔥',
};
