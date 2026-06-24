import { StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from '@/components/Text';

import { theme } from '@/theme';
import { Icon } from './Icon';

/** The Today dashboard's "sticky note" streak badge — a warm, slightly tilted
 * card with a flame and the current logging streak. */
export function StreakBadge({ days, style }: { days: number; style?: ViewStyle }) {
  return (
    <View style={[styles.note, style]}>
      <Icon name="flameFilled" size={16} color="#F2741B" />
      <Text style={styles.text}>{days}-day{'\n'}streak</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    backgroundColor: '#FCEBD0',
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    gap: 2,
    transform: [{ rotate: '4deg' }],
    shadowColor: '#A9762B',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  text: { fontSize: theme.fontSize.caption, fontWeight: '700', color: '#7A4A12', textAlign: 'center', lineHeight: 15 },
});
