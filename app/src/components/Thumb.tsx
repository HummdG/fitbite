import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, ViewStyle } from 'react-native';

import { foodTile } from '@/lib/foodCategory';
import { theme } from '@/theme';
import { Icon, IconName } from './Icon';

type Props = {
  size?: number;
  radius?: number;
  /** Dish name → derives the category icon + on-brand tint. */
  name?: string;
  /** Explicit icon override (wins over the name-derived one). */
  icon?: IconName;
  style?: ViewStyle;
};

/**
 * A colourful, on-brand stand-in for a food photo: a soft category-tinted
 * gradient tile with a matching glyph. Different dishes get different tints, so
 * lists read as varied imagery rather than a wall of identical placeholders.
 */
export function Thumb({ size = 56, radius = theme.radius.lg, name, icon, style }: Props) {
  const tile = foodTile(name);
  const glyph = icon ?? tile.icon;
  return (
    <LinearGradient
      colors={tile.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.box, { width: size, height: size, borderRadius: radius }, style]}
    >
      <Icon name={glyph} size={Math.round(size * 0.46)} color={tile.base} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
