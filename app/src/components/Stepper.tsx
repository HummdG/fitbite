import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import { theme } from '@/theme';

type Props = { step: number; total: number; label?: string };

/** Onboarding progress: a row of segment bars + "n / total" counter. */
export function Stepper({ step, total, label }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.bars}>
        {Array.from({ length: total }).map((_, i) => (
          <View key={i} style={[styles.bar, i < step ? styles.barOn : styles.barOff]} />
        ))}
      </View>
      <Text style={styles.count}>
        {label ? `${label} · ` : ''}
        {step} / {total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: theme.spacing.lg },
  bars: { flexDirection: 'row', gap: theme.spacing.xs },
  bar: { flex: 1, height: 6, borderRadius: theme.radius.pill },
  barOn: { backgroundColor: theme.color.pink },
  barOff: { backgroundColor: theme.color.blushMist },
  count: { marginTop: 6, fontSize: theme.fontSize.caption, color: theme.color.textSecondary, fontWeight: '600' },
});
