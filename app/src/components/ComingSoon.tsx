import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import { theme } from '@/theme';
import { Icon } from './Icon';
import { ScreenContainer } from './ScreenContainer';

export function ComingSoon({ title }: { title: string }) {
  return (
    <ScreenContainer scroll={false}>
      <View style={styles.wrap}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.subRow}>
          <Icon name="sparkles" size={16} color={theme.color.pink} weight="duotone" />
          <Text style={styles.sub}>Coming soon</Text>
        </View>
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
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  sub: { fontSize: theme.fontSize.subtitle, color: theme.color.pink, fontWeight: '700' },
  body: {
    textAlign: 'center',
    color: theme.color.textSecondary,
    marginTop: theme.spacing.md,
    lineHeight: 20,
  },
});
