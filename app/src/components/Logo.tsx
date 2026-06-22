import { View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Mask, Path, Rect, Stop } from 'react-native-svg';

import { theme } from '@/theme';
import { Text } from './Text';

type Props = {
  /** Width/height of the cloche mark in px. */
  size?: number;
  /** Render the "FitBite" wordmark beneath the mark. */
  withWordmark?: boolean;
  style?: ViewStyle;
};

/**
 * The FitBite cloche mark — a flat, gradient food dome with a bite out of the
 * upper-right — drawn as vectors so it stays crisp at every size (replaces the
 * old raster logo.png). The bite is an alpha mask, so it shows whatever sits
 * behind the logo regardless of background colour.
 */
export function LogoMark({ size = 96 }: { size?: number }) {
  const plum = theme.color.plumShadow;
  const sw = 5;
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id="fbDome" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FB6FB0" />
          <Stop offset="0.55" stopColor="#F13A94" />
          <Stop offset="1" stopColor="#B5179E" />
        </LinearGradient>
        <Mask id="fbBite">
          <Rect x="0" y="0" width="120" height="120" fill="#fff" />
          <Circle cx="85" cy="54" r="15" fill="#000" />
        </Mask>
      </Defs>

      {/* plate */}
      <Rect
        x="20"
        y="84"
        width="80"
        height="11"
        rx="5.5"
        fill="url(#fbDome)"
        stroke={plum}
        strokeWidth={sw}
        strokeLinejoin="round"
      />

      {/* dome + knob, with the bite masked out */}
      <G mask="url(#fbBite)">
        <Path
          d="M 30 84 A 30 30 0 0 1 90 84 Z"
          fill="url(#fbDome)"
          stroke={plum}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
        <Circle cx="60" cy="49" r="5.5" fill="url(#fbDome)" stroke={plum} strokeWidth={sw} />
      </G>
    </Svg>
  );
}

export function Logo({ size = 96, withWordmark = false, style }: Props) {
  const wordSize = Math.round(size * 0.34);
  return (
    <View style={[{ alignItems: 'center' }, style]}>
      <LogoMark size={size} />
      {withWordmark && (
        <Text style={{ marginTop: Math.round(size * 0.08), fontSize: wordSize, fontWeight: '700' }}>
          <Text style={{ color: theme.color.plumShadow, fontSize: wordSize, fontWeight: '700' }}>Fit</Text>
          <Text style={{ color: theme.color.pink, fontSize: wordSize, fontWeight: '700' }}>Bite</Text>
        </Text>
      )}
    </View>
  );
}
