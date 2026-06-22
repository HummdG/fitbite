import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import { theme } from '@/theme';
import type { MacroKey } from '@/types/api';
import type { Totals } from '@/features/today/useToday';
import { MacroRing } from './MacroRing';

export type MacroTargets = {
  calorie_target: number;
  protein_target_g: number;
  carbs_target_g: number;
  fat_target_g: number;
  fibre_target_g: number;
};

type Props = {
  totals: Totals;
  targets: MacroTargets;
  widgets: MacroKey[];
};

const META: Record<MacroKey, { label: string; color: string; value: (t: Totals) => number; target: (t: MacroTargets) => number }> = {
  calories: { label: 'Calories', color: theme.color.macro.calories, value: (t) => t.calories, target: (m) => m.calorie_target },
  protein: { label: 'Protein', color: theme.color.macro.protein, value: (t) => t.protein_g, target: (m) => m.protein_target_g },
  carbs: { label: 'Carbs', color: theme.color.macro.carbs, value: (t) => t.carbs_g, target: (m) => m.carbs_target_g },
  fat: { label: 'Fat', color: theme.color.macro.fat, value: (t) => t.fat_g, target: (m) => m.fat_target_g },
  fibre: { label: 'Fibre', color: theme.color.berry, value: (t) => t.fibre_g, target: (m) => m.fibre_target_g },
};

/** The Today dashboard's macro rings — a prominent Calories ring plus mini rings
 * for whichever macros the user enabled in `dashboard_widgets`. */
export function MacroSummary({ totals, targets, widgets }: Props) {
  const showCalories = widgets.includes('calories');
  const others = widgets.filter((w) => w !== 'calories');

  const caloriesLeft = META.calories.target(targets) - META.calories.value(totals);

  return (
    <View style={styles.wrap}>
      {showCalories && (
        <View style={styles.bigRing}>
          <MacroRing
            value={META.calories.value(totals)}
            target={META.calories.target(targets)}
            color={META.calories.color}
            size={168}
            caption={caloriesLeft >= 0 ? `${caloriesLeft.toLocaleString()} kcal left` : `${Math.abs(caloriesLeft).toLocaleString()} over`}
          />
        </View>
      )}

      {others.length > 0 && (
        <View style={styles.row}>
          {others.map((key) => {
            const m = META[key];
            const value = m.value(totals);
            const target = m.target(targets);
            return (
              <View key={key} style={styles.miniWrap}>
                <MacroRing value={value} target={target} color={m.color} size={88} stroke={9} caption="g" />
                <Text style={styles.miniLabel}>{m.label}</Text>
                <Text style={styles.miniSub}>
                  {value} / {target}g
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  bigRing: { marginBottom: theme.spacing.lg },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: theme.spacing.lg },
  miniWrap: { alignItems: 'center', width: 96 },
  miniLabel: { fontSize: theme.fontSize.caption, fontWeight: '700', color: theme.color.textPrimary, marginTop: 6 },
  miniSub: { fontSize: theme.fontSize.caption, color: theme.color.textSecondary },
});
