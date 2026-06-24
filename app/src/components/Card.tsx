import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { cardShadow, theme } from '@/theme';

/** White surface with a soft shadow — the mockups' borderless rounded cards. */
export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.color.card,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    ...cardShadow(),
  },
});
