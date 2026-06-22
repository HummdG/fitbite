import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import { theme } from '@/theme';

export type ChipOption<T extends string> = { label: string; value: T };

type Props<T extends string> = {
  label?: string;
  options: ChipOption<T>[];
  value: T | T[] | null;
  onChange: (value: T | T[]) => void;
  multi?: boolean;
};

export function ChipGroup<T extends string>({ label, options, value, onChange, multi = false }: Props<T>) {
  const isSelected = (v: T) =>
    multi ? Array.isArray(value) && value.includes(v) : value === v;

  const toggle = (v: T) => {
    if (multi) {
      const arr = Array.isArray(value) ? value : [];
      onChange(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
    } else {
      onChange(v);
    }
  };

  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.wrap}>
        {options.map((o) => {
          const on = isSelected(o.value);
          return (
            <Pressable
              key={o.value}
              accessibilityRole="button"
              onPress={() => toggle(o.value)}
              style={[styles.chip, on && styles.chipOn]}
            >
              <Text style={[styles.text, on && styles.textOn]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: theme.fontSize.body,
    color: theme.color.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  chip: {
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.color.border,
    backgroundColor: theme.color.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipOn: { backgroundColor: theme.color.pink, borderColor: theme.color.pink },
  text: { color: theme.color.textPrimary, fontSize: theme.fontSize.body, fontWeight: '600' },
  textOn: { color: theme.color.textOnPink },
});
