import { useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';

import { theme } from '@/theme';

type Props = {
  data: number[];
  height?: number;
  color?: string;
};

/** Minimal SVG line chart (area + line + end marker) over react-native-svg.
 * Width is measured from the parent; baseline is 0 with 10% headroom. */
export function LineChart({ data, height = 180, color = theme.color.pink }: Props) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const padY = 12;
  const innerH = height - padY * 2;
  const max = Math.max(...data, 1) * 1.1;
  const n = data.length;

  const x = (i: number) => (n <= 1 ? width / 2 : (i / (n - 1)) * width);
  const y = (v: number) => padY + innerH * (1 - v / max);

  const points = data.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const baseline = padY + innerH;
  const area =
    n > 0 ? `M ${x(0)},${baseline} L ${data.map((v, i) => `${x(i)},${y(v)}`).join(' L ')} L ${x(n - 1)},${baseline} Z` : '';

  return (
    <View onLayout={onLayout} style={{ height }}>
      {width > 0 && n > 0 && (
        <Svg width={width} height={height}>
          <Line x1={0} y1={baseline} x2={width} y2={baseline} stroke={theme.color.border} strokeWidth={1} />
          <Path d={area} fill={`${color}1A`} />
          <Polyline points={points} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
          <Circle cx={x(n - 1)} cy={y(data[n - 1])} r={5} fill={color} stroke={theme.color.card} strokeWidth={2} />
        </Svg>
      )}
    </View>
  );
}
