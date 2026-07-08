import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import { theme } from '@/theme';
import { Icon } from './Icon';

type Props = { step: number; total: number; onBack?: () => void; onLogout?: () => void };

/** Onboarding top bar: an optional back chevron on the left, an optional "Log out"
 * escape, and an "n / total" step counter on the right, matching the mockup header. */
export function Stepper({ step, total, onBack, onLogout }: Props) {
  return (
    <View style={styles.wrap}>
      {onBack ? (
        <Pressable accessibilityRole="button" onPress={onBack} hitSlop={10} style={styles.back}>
          <Icon name="chevronBack" size={24} color={theme.color.textPrimary} />
        </Pressable>
      ) : (
        <View style={styles.back} />
      )}
      <View style={styles.right}>
        {onLogout && (
          <Pressable accessibilityRole="button" accessibilityLabel="Log out" onPress={onLogout} hitSlop={10}>
            <Text style={styles.logout}>Log out</Text>
          </Pressable>
        )}
        <Text style={styles.count}>
          {step} / {total}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  back: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  right: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  logout: { fontSize: theme.fontSize.caption, color: theme.color.pink, fontWeight: '700' },
  count: { fontSize: theme.fontSize.body, color: theme.color.textSecondary, fontWeight: '600' },
});
