import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { theme } from '@/theme';

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.color.card,
    borderColor: theme.color.border,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    shadowColor: theme.shadow.card.color,
    shadowOpacity: theme.shadow.card.opacity,
    shadowRadius: theme.shadow.card.radius,
    shadowOffset: { width: 0, height: theme.shadow.card.offsetY },
    elevation: 2,
  },
});
