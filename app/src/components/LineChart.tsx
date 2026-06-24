import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Line, Path, Stop, Text as SvgText } from 'react-native-svg';

import { theme } from '@/theme';
import { Text } from './Text';

type Props = {
  data: number[];
  /** Optional labels rendered under the chart; only the first and last show. */
  labels?: string[];
  height?: number;
  color?: string;
  /** Draws a dashed horizontal goal line + label at this value. */
  goal?: number;
  goalLabel?: string;
  /** Render left-hand y-axis value labels. */
  showAxis?: boolean;
};

type Pt = { x: number; y: number };

/** Smooth (Catmull-Rom → cubic-bezier) path through the points. */
function smooth(pts: Pt[]): string {
  if (pts.length < 2) return pts.length ? `M ${pts[0].x} ${pts[0].y}` : '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/** Soft SVG area chart: gradient fill + smooth line + markers, goal line + y-axis. */
export function LineChart({ data, labels, height = 180, color = theme.color.pink, goal, goalLabel, showAxis }: Props) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const padY = 16;
  const padL = showAxis ? 38 : 0;
  const innerH = height - padY * 2;
  const max = Math.max(...data, goal ?? 0, 1) * 1.12;
  const n = data.length;
  const plotW = Math.max(0, width - padL);

  const x = (i: number) => (n <= 1 ? padL + plotW / 2 : padL + (i / (n - 1)) * plotW);
  const y = (v: number) => padY + innerH * (1 - v / max);
  const pts: Pt[] = data.map((v, i) => ({ x: x(i), y: y(v) }));

  const line = smooth(pts);
  const baseline = padY + innerH;
  const area = n > 0 ? `${line} L ${x(n - 1)} ${baseline} L ${x(0)} ${baseline} Z` : '';
  const grid = [0, 0.33, 0.66, 1]; // fractions of max, top→bottom in value space

  return (
    <View>
      <View onLayout={onLayout} style={{ height }}>
        {width > 0 && n > 0 && (
          <Svg width={width} height={height}>
            <Defs>
              <LinearGradient id="fbArea" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={color} stopOpacity={0.26} />
                <Stop offset="1" stopColor={color} stopOpacity={0.02} />
              </LinearGradient>
            </Defs>
            {grid.map((g) => {
              const v = max * g;
              const yy = y(v);
              return (
                <G key={g}>
                  <Line x1={padL} y1={yy} x2={width} y2={yy} stroke={theme.color.border} strokeWidth={1} strokeDasharray="2 6" />
                  {showAxis && (
                    <SvgText x={padL - 6} y={yy + 4} fontSize={10} fill={theme.color.textSecondary} textAnchor="end" fontFamily={theme.fontFamily.medium}>
                      {Math.round(v).toLocaleString()}
                    </SvgText>
                  )}
                </G>
              );
            })}
            {goal != null && goal > 0 && (
              <>
                <Line x1={padL} y1={y(goal)} x2={width} y2={y(goal)} stroke={theme.color.textSecondary} strokeWidth={1.5} strokeDasharray="5 5" />
                {!!goalLabel && (
                  <SvgText x={width} y={y(goal) - 5} fontSize={10} fill={theme.color.textSecondary} textAnchor="end" fontFamily={theme.fontFamily.semibold}>
                    {goalLabel}
                  </SvgText>
                )}
              </>
            )}
            <Path d={area} fill="url(#fbArea)" />
            <Path d={line} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
            {pts.map((p, i) => (
              <Circle key={i} cx={p.x} cy={p.y} r={i === n - 1 ? 5 : 3.5} fill={color} stroke={theme.color.card} strokeWidth={2} />
            ))}
          </Svg>
        )}
      </View>
      {labels && labels.length > 1 && (
        <View style={[styles.labels, { paddingLeft: padL }]}>
          <Text style={styles.label}>{labels[0]}</Text>
          <Text style={styles.label}>{labels[labels.length - 1]}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  label: { fontSize: theme.fontSize.caption, color: theme.color.textSecondary },
});
