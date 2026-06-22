import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import { theme } from '@/theme';

export type Segment<T extends string> = { label: string; value: T };

type Props<T extends string> = {
  options: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Pill-style segmented control (strictness, 7/30/90-day range, …). */
export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.track}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="button"
            onPress={() => onChange(o.value)}
            style={[styles.seg, on && styles.segOn]}
          >
            <Text style={[styles.text, on && styles.textOn]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: theme.color.blushMist,
    borderRadius: theme.radius.pill,
    padding: 4,
    gap: 4,
  },
  seg: {
    flex: 1,
    borderRadius: theme.radius.pill,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segOn: {
    backgroundColor: theme.color.card,
    shadowColor: theme.shadow.card.color,
    shadowOpacity: theme.shadow.card.opacity,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  text: { fontSize: theme.fontSize.body, fontWeight: '600', color: theme.color.textSecondary },
  textOn: { color: theme.color.pink },
});
