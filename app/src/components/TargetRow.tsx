import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import { cardShadow, theme, withAlpha } from '@/theme';
import { Icon, IconName } from './Icon';

type Props = {
  icon: IconName;
  label: string;
  value: number | string;
  unit?: string;
  color: string;
  /** 0..1 — when set, a progress bar is drawn under the value. */
  progress?: number;
  /** Bar fill colour (defaults to the icon `color`). */
  barColor?: string;
};

/** A computed-target card: tinted icon, label, big value and an optional bar.
 * Used on the onboarding "Your targets" step. */
export function TargetRow({ icon, label, value, unit, color, progress, barColor }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={[styles.iconWrap, { backgroundColor: withAlpha(color, 0x22) }]}>
          <Icon name={icon} size={22} color={color} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>
            {typeof value === 'number' ? value.toLocaleString() : value}
            {unit ? <Text style={styles.unit}> {unit}</Text> : null}
          </Text>
        </View>
      </View>
      {progress != null && (
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.max(0, Math.min(1, progress)) * 100}%`, backgroundColor: barColor ?? color }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.color.card, borderRadius: theme.radius.lg, padding: theme.spacing.md, gap: theme.spacing.sm, ...cardShadow() },
  top: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  iconWrap: { width: 42, height: 42, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center' },
  textWrap: { flex: 1 },
  label: { fontSize: theme.fontSize.caption, color: theme.color.textSecondary, fontWeight: '600' },
  value: { fontSize: theme.fontSize.title, fontWeight: '800', color: theme.color.textPrimary },
  unit: { fontSize: theme.fontSize.body, fontWeight: '600', color: theme.color.textSecondary },
  track: { height: 6, borderRadius: theme.radius.pill, backgroundColor: theme.color.blushMist, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: theme.radius.pill },
});
