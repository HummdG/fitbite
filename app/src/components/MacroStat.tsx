import { StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from '@/components/Text';

import { theme, withAlpha } from '@/theme';
import { Icon, IconName } from './Icon';

type Props = {
  icon: IconName;
  label: string;
  value: number | string;
  unit?: string;
  color: string;
  style?: ViewStyle;
};

/** A single macro tile: tinted icon, value + unit, label. Used on the targets
 * step and item-details macro grid. */
export function MacroStat({ icon, label, value, unit, color, style }: Props) {
  return (
    <View
      style={[styles.card, { backgroundColor: withAlpha(color, 0x0e), borderColor: withAlpha(color, 0x2e) }, style]}
    >
      <View style={[styles.iconWrap, { backgroundColor: withAlpha(color, 0x22) }]}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <Text style={styles.value}>
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit ? <Text style={styles.unit}> {unit}</Text> : null}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: 6,
  },
  iconWrap: { width: 40, height: 40, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: theme.fontSize.title, fontWeight: '700', color: theme.color.textPrimary },
  unit: { fontSize: theme.fontSize.body, fontWeight: '600', color: theme.color.textSecondary },
  label: { fontSize: theme.fontSize.caption, color: theme.color.textSecondary, fontWeight: '600' },
});
