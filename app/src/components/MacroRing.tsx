import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import Svg, { Circle } from 'react-native-svg';

import { theme } from '@/theme';

type Props = {
  value: number;
  target: number;
  /** Small line under the value, e.g. "kcal" or "/ 150 g". */
  caption?: string;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
};

function valueFont(size: number): number {
  if (size >= 150) return theme.fontSize.display;
  if (size >= 110) return theme.fontSize.title;
  if (size >= 84) return theme.fontSize.subtitle;
  return theme.fontSize.body;
}

export function MacroRing({
  value,
  target,
  caption,
  size = 168,
  stroke = 16,
  color = theme.color.macro.calories,
  trackColor = theme.color.blushMist,
}: Props) {
  const pct = target > 0 ? Math.min(value / target, 1) : 0;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct);
  const center = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={center} cy={center} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <Circle
          cx={center}
          cy={center}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <Text style={[styles.value, { fontSize: valueFont(size) }]}>{value.toLocaleString()}</Text>
      {!!caption && <Text style={styles.caption}>{caption}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  value: { fontWeight: '700', color: theme.color.textPrimary },
  caption: { fontSize: theme.fontSize.caption, color: theme.color.textSecondary, marginTop: 2 },
});
