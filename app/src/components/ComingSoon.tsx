import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme';
import { ScreenContainer } from './ScreenContainer';

export function ComingSoon({ title }: { title: string }) {
  return (
    <ScreenContainer scroll={false}>
      <View style={styles.wrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>Coming soon ✨</Text>
        <Text style={styles.body}>
          This tab is part of the full FitBite experience — we&apos;re shipping the core scan-and-track
          flow first.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: theme.spacing.xxl },
  title: { fontSize: theme.fontSize.title, fontWeight: '700', color: theme.color.textPrimary },
  sub: { fontSize: theme.fontSize.subtitle, color: theme.color.pink, fontWeight: '700', marginTop: 8 },
  body: {
    textAlign: 'center',
    color: theme.color.textSecondary,
    marginTop: theme.spacing.md,
    lineHeight: 20,
  },
});
