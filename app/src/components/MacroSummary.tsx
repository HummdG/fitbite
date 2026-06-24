import { StyleSheet, View, ViewStyle } from 'react-native';

import { theme } from '@/theme';
import type { MacroKey } from '@/types/api';
import type { Totals } from '@/features/today/useToday';
import { MacroGauge } from './MacroGauge';
import { IconName } from './Icon';

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
  style?: ViewStyle;
};

const META: Record<
  MacroKey,
  { label: string; icon: IconName; color: string; unit: string; value: (t: Totals) => number; target: (m: MacroTargets) => number }
> = {
  calories: { label: 'Calories', icon: 'calories', color: theme.color.macro.calories, unit: 'kcal', value: (t) => t.calories, target: (m) => m.calorie_target },
  protein: { label: 'Protein', icon: 'protein', color: theme.color.macro.protein, unit: 'g', value: (t) => t.protein_g, target: (m) => m.protein_target_g },
  fibre: { label: 'Fibre', icon: 'fibre', color: theme.color.macro.fibre, unit: 'g', value: (t) => t.fibre_g, target: (m) => m.fibre_target_g },
  carbs: { label: 'Carbs', icon: 'carbs', color: theme.color.macro.carbs, unit: 'g', value: (t) => t.carbs_g, target: (m) => m.carbs_target_g },
  fat: { label: 'Fat', icon: 'fat', color: theme.color.macro.fat, unit: 'g', value: (t) => t.fat_g, target: (m) => m.fat_target_g },
};

/** The Today dashboard's macro gauges — one circular progress gauge per enabled
 * dashboard widget (Calories / Protein / Fibre by default). */
export function MacroSummary({ totals, targets, widgets, style }: Props) {
  const shown = widgets.filter((w) => META[w]);
  return (
    <View style={[styles.row, style]}>
      {shown.map((key) => {
        const m = META[key];
        return (
          <MacroGauge
            key={key}
            icon={m.icon}
            label={m.label}
            value={m.value(totals)}
            target={m.target(targets)}
            unit={m.unit}
            color={m.color}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', rowGap: theme.spacing.lg },
});
