import { StyleSheet, View } from 'react-native';

import { theme, withAlpha } from '@/theme';

type Props = {
  data: number[];
  color?: string;
  height?: number;
};

/** A clean vertical bar chart (rounded tops on a soft baseline) — used for the
 * per-day totals on the Progress screen. Zero-value days render as a faint stub
 * so the baseline stays readable across the whole range. */
export function BarChart({ data, color = theme.color.pink, height = 132 }: Props) {
  const max = Math.max(...data, 1);
  return (
    <View>
      <View style={[styles.wrap, { height }]}>
        {data.map((v, i) => (
          <View key={i} style={styles.col}>
            <View
              style={[
                styles.bar,
                {
                  height: `${Math.max(2, (v / max) * 100)}%`,
                  backgroundColor: v > 0 ? color : withAlpha(color, 0x2e),
                },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={[styles.baseline, { backgroundColor: withAlpha(color, 0x33) }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  col: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderTopLeftRadius: 6, borderTopRightRadius: 6, minHeight: 4 },
  baseline: { height: 2, borderRadius: 1, marginTop: 4 },
});
