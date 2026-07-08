import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import { theme, withAlpha } from '@/theme';
import { Icon, IconName } from './Icon';

type Props = {
  icon: IconName;
  /** Emoji shown in the chip instead of the line icon. */
  emoji?: string;
  label: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  /** Tint for the icon chip (defaults to brand pink). */
  tint?: string;
  /** Render a checkbox circle in the corner (dashboard-widget chooser). */
  checkbox?: boolean;
  disabled?: boolean;
};

/** Selectable icon card — onboarding goal/strictness choices and the dashboard
 * widget chooser. With `checkbox`, a circle in the corner reflects selection. */
export function SelectCard({ icon, emoji, label, subtitle, selected, onPress, tint = theme.color.pink, checkbox, disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardOn,
        { opacity: disabled ? 0.45 : pressed ? 0.92 : 1 },
      ]}
    >
      {checkbox && (
        <View style={[styles.box, selected ? styles.boxOn : styles.boxOff]}>
          {selected && <Icon name="check" size={13} color={theme.color.textOnPink} />}
        </View>
      )}
      <View style={[styles.iconWrap, { backgroundColor: withAlpha(tint, 0x1f) }]}>
        {emoji ? <Text style={styles.emoji}>{emoji}</Text> : <Icon name={icon} size={22} color={tint} />}
      </View>
      <Text style={styles.label}>{label}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {!checkbox && selected && (
        <View style={styles.check}>
          <Icon name="checkCircle" size={20} color={theme.color.pink} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 96,
    backgroundColor: theme.color.card,
    borderColor: theme.color.border,
    borderWidth: 1.5,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: 6,
  },
  cardOn: { borderColor: theme.color.pink, backgroundColor: withAlpha(theme.color.pink, 0x0f) },
  iconWrap: { width: 40, height: 40, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 22 },
  label: { fontSize: theme.fontSize.body, fontWeight: '700', color: theme.color.textPrimary },
  subtitle: { fontSize: theme.fontSize.caption, color: theme.color.textSecondary },
  check: { position: 'absolute', top: theme.spacing.sm, right: theme.spacing.sm },
  box: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: theme.color.pink },
  boxOff: { borderWidth: 1.5, borderColor: theme.color.border },
});
