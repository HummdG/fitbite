import { theme } from '@/theme';
import { MACRO_EMOJI } from '@/lib/emoji';
import type { MacroKey } from '@/types/api';

/**
 * Single source of truth for everything a macro needs to render across the app:
 * the Today dials, the editable profile goals, and the Add-food form. Keeping
 * one registry means enabling a dashboard widget keeps the goal list and the
 * Add-food boxes in sync automatically.
 */
export interface MacroMeta {
  key: MacroKey;
  label: string;
  emoji: string;
  color: string;
  /** Short unit shown on the dials, e.g. 'kcal' | 'g'. */
  unit: string;
  /** Unit shown next to an editable goal, e.g. 'kcal/day' | 'g/day'. */
  goalUnit: string;
  /** Column on ProfileRow / MacroTargets holding this macro's target. */
  targetField: 'calorie_target' | 'protein_target_g' | 'carbs_target_g' | 'fat_target_g' | 'fibre_target_g';
  /** Field on Totals / AddToTodayInput holding this macro's logged amount. */
  totalField: 'calories' | 'protein_g' | 'carbs_g' | 'fat_g' | 'fibre_g';
}

/** Canonical display order for any macro selection. */
export const MACRO_ORDER: MacroKey[] = ['calories', 'protein', 'carbs', 'fat', 'fibre'];

export const MACROS: Record<MacroKey, MacroMeta> = {
  calories: {
    key: 'calories',
    label: 'Calories',
    emoji: MACRO_EMOJI.calories,
    color: theme.color.macro.calories,
    unit: 'kcal',
    goalUnit: 'kcal/day',
    targetField: 'calorie_target',
    totalField: 'calories',
  },
  protein: {
    key: 'protein',
    label: 'Protein',
    emoji: MACRO_EMOJI.protein,
    color: theme.color.macro.protein,
    unit: 'g',
    goalUnit: 'g/day',
    targetField: 'protein_target_g',
    totalField: 'protein_g',
  },
  carbs: {
    key: 'carbs',
    label: 'Carbs',
    emoji: MACRO_EMOJI.carbs,
    color: theme.color.macro.carbs,
    unit: 'g',
    goalUnit: 'g/day',
    targetField: 'carbs_target_g',
    totalField: 'carbs_g',
  },
  fat: {
    key: 'fat',
    label: 'Fat',
    emoji: MACRO_EMOJI.fat,
    color: theme.color.macro.fat,
    unit: 'g',
    goalUnit: 'g/day',
    targetField: 'fat_target_g',
    totalField: 'fat_g',
  },
  fibre: {
    key: 'fibre',
    label: 'Fibre',
    emoji: MACRO_EMOJI.fibre,
    color: theme.color.macro.fibre,
    unit: 'g',
    goalUnit: 'g/day',
    targetField: 'fibre_target_g',
    totalField: 'fibre_g',
  },
};

/** Return `keys` in canonical {@link MACRO_ORDER}, dropping anything unknown. */
export const orderMacros = (keys: MacroKey[]): MacroKey[] => MACRO_ORDER.filter((k) => keys.includes(k));
