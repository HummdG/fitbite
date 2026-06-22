import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { softShadow, theme } from '@/theme';

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.color.card,
    borderColor: theme.color.border,
    borderWidth: 1,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    ...softShadow(),
  },
});
