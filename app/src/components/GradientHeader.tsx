import { ReactNode } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '@/theme';

export function GradientHeader({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <LinearGradient
      colors={theme.gradient.main as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
  },
});
