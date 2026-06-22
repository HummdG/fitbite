import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import { theme } from '@/theme';
import { Icon, IconName } from './Icon';

type Props = {
  icon: IconName;
  label: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
};

/** Selectable icon card (onboarding goal choices, dashboard-widget chooser). */
export function SelectCard({ icon, label, subtitle, selected, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.card, selected && styles.cardOn, { opacity: pressed ? 0.92 : 1 }]}
    >
      <View style={[styles.iconWrap, selected && styles.iconWrapOn]}>
        <Icon name={icon} size={24} color={selected ? theme.color.textOnPink : theme.color.pink} />
      </View>
      <Text style={[styles.label, selected && styles.labelOn]}>{label}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {selected && (
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
    minWidth: 140,
    backgroundColor: theme.color.card,
    borderColor: theme.color.border,
    borderWidth: 1.5,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: 6,
  },
  cardOn: { borderColor: theme.color.pink, backgroundColor: `${theme.color.pink}0D` },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: `${theme.color.pink}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapOn: { backgroundColor: theme.color.pink },
  label: { fontSize: theme.fontSize.body, fontWeight: '700', color: theme.color.textPrimary },
  labelOn: { color: theme.color.pink },
  subtitle: { fontSize: theme.fontSize.caption, color: theme.color.textSecondary },
  check: { position: 'absolute', top: theme.spacing.md, right: theme.spacing.md },
});
