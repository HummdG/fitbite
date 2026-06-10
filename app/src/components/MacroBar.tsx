import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme';

type Props = {
  label: string;
  value: number;
  target: number;
  unit?: string;
  color?: string;
};

export function MacroBar({ label, value, target, unit = 'g', color = theme.color.pink }: Props) {
  const pct = target > 0 ? Math.min(value / target, 1) : 0;
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {value} / {target}
          {unit}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: theme.spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { color: theme.color.textSecondary, fontSize: theme.fontSize.body },
  value: { color: theme.color.textPrimary, fontWeight: '600', fontSize: theme.fontSize.body },
  track: {
    height: 12,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.color.blushMist,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: theme.radius.pill },
});
