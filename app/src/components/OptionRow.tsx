import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from '@/components/Text';

import { softShadow, theme } from '@/theme';
import { Icon, IconName } from './Icon';

type Props = {
  icon: IconName;
  title: string;
  subtitle?: string;
  /** Right-aligned value rendered before the trailing chevron. */
  value?: string;
  onPress?: () => void;
  /** Custom trailing element; defaults to a chevron when `onPress` is set. */
  trailing?: ReactNode;
  tint?: string;
  disabled?: boolean;
  /** Extra style for the card (e.g. `flex: 1` to fill a column). */
  style?: StyleProp<ViewStyle>;
};

/** Tappable card row with a tinted leading icon — scan options, settings rows. */
export function OptionRow({ icon, title, subtitle, value, onPress, trailing, tint = theme.color.pink, disabled, style }: Props) {
  const trailingNode =
    trailing !== undefined ? trailing : onPress ? <Icon name="chevron" size={20} color={theme.color.textSecondary} /> : null;

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      disabled={disabled || !onPress}
      style={({ pressed }) => [styles.row, { opacity: disabled ? 0.5 : pressed ? 0.9 : 1 }, style]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${tint}1A` }]}>
        <Icon name={icon} size={22} color={tint} weight="duotone" />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {!!value && <Text style={styles.value}>{value}</Text>}
      {trailingNode}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.color.card,
    borderColor: theme.color.border,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    ...softShadow(),
  },
  iconWrap: { width: 44, height: 44, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center' },
  textWrap: { flex: 1 },
  title: { fontSize: theme.fontSize.body, fontWeight: '700', color: theme.color.textPrimary },
  subtitle: { fontSize: theme.fontSize.caption, color: theme.color.textSecondary, marginTop: 2 },
  value: { fontSize: theme.fontSize.body, fontWeight: '700', color: theme.color.textPrimary, marginRight: 2 },
});
