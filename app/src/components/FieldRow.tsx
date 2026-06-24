import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { Text } from '@/components/Text';

import { cardShadow, theme, withAlpha } from '@/theme';
import { Icon, IconName } from './Icon';

type Props = TextInputProps & {
  icon: IconName;
  label: string;
  unit?: string;
  tint?: string;
};

/** A labelled input styled as a settings row: tinted icon, label, and a
 * right-aligned value. Used for the onboarding "About you" numeric fields. */
export function FieldRow({ icon, label, unit, tint = theme.color.pink, style, ...props }: Props) {
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: withAlpha(tint, 0x1f) }]}>
        <Icon name={icon} size={20} color={tint} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.color.textSecondary}
        style={[styles.input, style]}
        {...props}
      />
      {!!unit && <Text style={styles.unit}>{unit}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.color.card,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    ...cardShadow(),
  },
  iconWrap: { width: 38, height: 38, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, fontSize: theme.fontSize.body, color: theme.color.textPrimary, fontWeight: '600' },
  input: {
    minWidth: 56,
    textAlign: 'right',
    fontSize: theme.fontSize.subtitle,
    fontFamily: theme.fontFamily.bold,
    color: theme.color.textPrimary,
    paddingVertical: 4,
  },
  unit: { fontSize: theme.fontSize.body, color: theme.color.textSecondary, fontWeight: '600' },
});
