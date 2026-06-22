import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import { theme, verdictColor, verdictLabel } from '@/theme';

export function Pill({ verdict }: { verdict: string }) {
  const color = verdictColor(verdict);
  return (
    <View style={[styles.pill, { backgroundColor: `${color}1A`, borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{verdictLabel(verdict)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: { fontSize: theme.fontSize.caption, fontWeight: '700' },
});
