import { StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from '@/components/Text';

import { theme, withAlpha } from '@/theme';
import { Icon, IconName } from './Icon';

type Props = {
  label: string;
  value: number | string;
  unit?: string;
  color: string;
  /** Optional leading icon chip (omit for the compact item-details tiles). */
  icon?: IconName;
  /** Optional secondary line, e.g. "Goal 2,000". */
  sub?: string;
  style?: ViewStyle;
};

/** A tinted macro tile: value + unit + label, with an optional icon and sub line. */
export function MacroStat({ icon, label, value, unit, color, sub, style }: Props) {
  return (
    <View
      style={[styles.card, { backgroundColor: withAlpha(color, 0x0e), borderColor: withAlpha(color, 0x29) }, style]}
    >
      {icon && (
        <View style={[styles.iconWrap, { backgroundColor: withAlpha(color, 0x22) }]}>
          <Icon name={icon} size={20} color={color} />
        </View>
      )}
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit ? <Text style={styles.unit}> {unit}</Text> : null}
      </Text>
      {!!sub && <Text style={styles.sub}>{sub}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 96,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: 4,
  },
  iconWrap: { width: 38, height: 38, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  label: { fontSize: theme.fontSize.caption, color: theme.color.textSecondary, fontWeight: '600' },
  value: { fontSize: theme.fontSize.title, fontWeight: '800', color: theme.color.textPrimary },
  unit: { fontSize: theme.fontSize.body, fontWeight: '600', color: theme.color.textSecondary },
  sub: { fontSize: theme.fontSize.caption, color: theme.color.textSecondary },
});
