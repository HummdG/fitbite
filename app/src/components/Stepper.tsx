import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import { theme } from '@/theme';
import { Icon } from './Icon';

type Props = { step: number; total: number; onBack?: () => void };

/** Onboarding top bar: an optional back chevron on the left and an "n / total"
 * step counter on the right, matching the mockup header. */
export function Stepper({ step, total, onBack }: Props) {
  return (
    <View style={styles.wrap}>
      {onBack ? (
        <Pressable accessibilityRole="button" onPress={onBack} hitSlop={10} style={styles.back}>
          <Icon name="chevronBack" size={24} color={theme.color.textPrimary} />
        </Pressable>
      ) : (
        <View style={styles.back} />
      )}
      <Text style={styles.count}>
        {step} / {total}
      </Text>
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
  count: { fontSize: theme.fontSize.body, color: theme.color.textSecondary, fontWeight: '600' },
});
