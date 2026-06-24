import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import { theme } from '@/theme';

export type Segment<T extends string> = { label: string; value: T };

type Props<T extends string> = {
  options: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Row of pill tabs — active is a solid pink pill, others sit on a light blush
 * fill. Used for the Progress range, macro tabs and the Profile units toggle. */
export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.row}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={[styles.seg, on ? styles.segOn : styles.segOff]}
          >
            <Text style={[styles.text, on && styles.textOn]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: theme.spacing.sm },
  seg: {
    borderRadius: theme.radius.pill,
    paddingVertical: 9,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segOn: { backgroundColor: theme.color.pink },
  segOff: { backgroundColor: theme.color.blush },
  text: { fontSize: theme.fontSize.body, fontWeight: '600', color: theme.color.textSecondary },
  textOn: { color: theme.color.textOnPink },
});
