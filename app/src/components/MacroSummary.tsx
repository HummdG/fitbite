import { StyleSheet, View, ViewStyle } from 'react-native';

import { theme } from '@/theme';
import { MACROS } from '@/lib/macros';
import type { MacroKey } from '@/types/api';
import type { Totals } from '@/features/today/useToday';
import { MacroGauge } from './MacroGauge';

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

/** The Today dashboard's macro gauges — one circular progress gauge per enabled
 * dashboard widget (Calories / Protein / Fibre by default). */
export function MacroSummary({ totals, targets, widgets, style }: Props) {
  const shown = widgets.filter((w) => MACROS[w]);
  return (
    <View style={[styles.row, style]}>
      {shown.map((key) => {
        const m = MACROS[key];
        return (
          <MacroGauge
            key={key}
            emoji={m.emoji}
            label={m.label}
            value={totals[m.totalField]}
            target={targets[m.targetField]}
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
