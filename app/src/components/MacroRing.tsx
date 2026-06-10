import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { theme } from '@/theme';

type Props = {
  value: number;
  target: number;
  unit?: string;
  size?: number;
  stroke?: number;
};

export function MacroRing({ value, target, unit = 'kcal', size = 168, stroke = 16 }: Props) {
  const pct = target > 0 ? Math.min(value / target, 1) : 0;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct);
  const center = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={center} cy={center} r={r} stroke={theme.color.blushMist} strokeWidth={stroke} fill="none" />
        <Circle
          cx={center}
          cy={center}
          r={r}
          stroke={theme.color.pink}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <Text style={styles.value}>{value.toLocaleString()}</Text>
      <Text style={styles.target}>
        / {target.toLocaleString()} {unit}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  value: { fontSize: theme.fontSize.display, fontWeight: '700', color: theme.color.textPrimary },
  target: { fontSize: theme.fontSize.body, color: theme.color.textSecondary, marginTop: 2 },
});
