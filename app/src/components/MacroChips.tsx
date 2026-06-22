import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { theme } from '@/theme';

type Props = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  style?: ViewStyle;
};

/** Compact colour-coded macro row (kcal · P · C · F) used on dish rows + details. */
export function MacroChips({ calories, protein, carbs, fat, style }: Props) {
  return (
    <View style={[styles.row, style]}>
      <Chip text={`${calories.toLocaleString()} kcal`} color={theme.color.macro.calories} />
      <Chip text={`${protein}g P`} color={theme.color.macro.protein} />
      <Chip text={`${carbs}g C`} color={theme.color.macro.carbs} />
      <Chip text={`${fat}g F`} color={theme.color.macro.fat} />
    </View>
  );
}

function Chip({ text, color }: { text: string; color: string }) {
  return (
    <View style={[styles.chip, { backgroundColor: `${color}1A` }]}>
      <Text style={[styles.chipText, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
  chip: {
    borderRadius: theme.radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipText: { fontSize: theme.fontSize.caption, fontWeight: '700' },
});
