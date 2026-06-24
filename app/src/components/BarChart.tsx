import { StyleSheet, View } from 'react-native';

import { theme, withAlpha } from '@/theme';

type Props = {
  data: number[];
  color?: string;
  height?: number;
};

/** A simple vertical bar chart (rounded tops) over flexbox — used for the
 * per-day totals on the Progress screen. Zero-value days render as a faint stub. */
export function BarChart({ data, color = theme.color.pink, height = 120 }: Props) {
  const max = Math.max(...data, 1);
  return (
    <View style={[styles.wrap, { height }]}>
      {data.map((v, i) => (
        <View key={i} style={styles.col}>
          <View
            style={[
              styles.bar,
              {
                height: `${Math.max(1.5, (v / max) * 100)}%`,
                backgroundColor: v > 0 ? color : withAlpha(color, 0x33),
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  col: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderTopLeftRadius: 4, borderTopRightRadius: 4, minHeight: 3 },
});
