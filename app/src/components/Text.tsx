import { Text as RNText, StyleSheet, TextProps, TextStyle } from 'react-native';

import { font, theme } from '@/theme';

/**
 * Drop-in replacement for React Native's <Text>. It reads the `fontWeight` from
 * the resolved style and swaps in the matching Poppins family, then strips the
 * raw weight so the platform doesn't apply faux-bolding on top. Default colour is
 * the brand's primary text so plain <Text> never renders pure black.
 */
export function Text({ style, ...rest }: TextProps) {
  const flat = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  const { fontWeight, fontFamily, color, ...restStyle } = flat;
  return (
    <RNText
      {...rest}
      style={[
        { fontFamily: fontFamily ?? font(fontWeight), color: color ?? theme.color.textPrimary },
        restStyle,
      ]}
    />
  );
}
