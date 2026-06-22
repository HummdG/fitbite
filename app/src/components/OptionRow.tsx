import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme';
import { Icon, IconName } from './Icon';

type Props = {
  icon: IconName;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  /** Custom trailing element; defaults to a chevron when `onPress` is set. */
  trailing?: ReactNode;
  tint?: string;
  disabled?: boolean;
};

/** Tappable card row with a tinted leading icon — scan options, settings rows. */
export function OptionRow({ icon, title, subtitle, onPress, trailing, tint = theme.color.pink, disabled }: Props) {
  const trailingNode =
    trailing !== undefined ? trailing : onPress ? <Icon name="chevron" size={20} color={theme.color.textSecondary} /> : null;

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      disabled={disabled || !onPress}
      style={({ pressed }) => [styles.row, { opacity: disabled ? 0.5 : pressed ? 0.9 : 1 }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${tint}1A` }]}>
        <Icon name={icon} size={22} color={tint} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
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
  },
  iconWrap: { width: 44, height: 44, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center' },
  textWrap: { flex: 1 },
  title: { fontSize: theme.fontSize.body, fontWeight: '700', color: theme.color.textPrimary },
  subtitle: { fontSize: theme.fontSize.caption, color: theme.color.textSecondary, marginTop: 2 },
});
