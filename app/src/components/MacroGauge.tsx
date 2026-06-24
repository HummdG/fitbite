import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Text } from '@/components/Text';

import { theme } from '@/theme';
import { Icon, IconName } from './Icon';

type Props = {
  icon: IconName;
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
  size?: number;
};

/** A circular progress gauge: a coloured ring with the percent-of-target and a
 * macro icon in the centre, and the label + "value / target unit" beneath.
 * This is the Today dashboard's primary metric (Calories / Protein / Fibre). */
export function MacroGauge({ icon, label, value, target, unit, color, size = 96 }: Props) {
  const pct = target > 0 ? Math.min(value / target, 1) : 0;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const center = size / 2;

  return (
    <View style={styles.wrap}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle cx={center} cy={center} r={r} stroke={theme.color.blushMist} strokeWidth={stroke} fill="none" />
          <Circle
            cx={center}
            cy={center}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${c} ${c}`}
            strokeDashoffset={c * (1 - pct)}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>
        <View style={styles.center}>
          <Icon name={icon} size={16} color={color} />
          <Text style={[styles.pct, { color }]}>{Math.round(pct * 100)}%</Text>
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.sub}>
        {value.toLocaleString()} / {target.toLocaleString()} {unit}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 2 },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', gap: 1 },
  pct: { fontSize: theme.fontSize.subtitle, fontWeight: '800' },
  label: { fontSize: theme.fontSize.body, fontWeight: '700', color: theme.color.textPrimary, marginTop: 6 },
  sub: { fontSize: theme.fontSize.caption, color: theme.color.textSecondary, textAlign: 'center' },
});
