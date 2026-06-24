import { StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from '@/components/Text';

import { theme, withAlpha } from '@/theme';

export type TagTone = 'good' | 'info' | 'warn' | 'bad' | 'neutral';

const TONE: Record<TagTone, string> = {
  good: theme.color.success,
  info: theme.color.indigo,
  warn: theme.color.warning,
  bad: theme.color.danger,
  neutral: theme.color.textSecondary,
};

/** A small rounded, tinted label — menu-result reasons (Best match, High protein…). */
export function Tag({ label, tone = 'neutral', style }: { label: string; tone?: TagTone; style?: ViewStyle }) {
  const color = TONE[tone];
  return (
    <View style={[styles.tag, { backgroundColor: withAlpha(color, 0x1f) }, style]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  text: { fontSize: theme.fontSize.caption, fontWeight: '700' },
});
