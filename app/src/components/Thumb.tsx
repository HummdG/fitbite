import { LinearGradient } from 'expo-linear-gradient';
import { Image, ImageStyle, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { foodTile } from '@/lib/foodCategory';
import { theme } from '@/theme';
import { Icon, IconName } from './Icon';

type Props = {
  size?: number;
  radius?: number;
  /** Dish name → derives the category icon + on-brand tint. */
  name?: string;
  /** A real dish photo (user upload / generated). Wins over the icon tile. */
  imageUrl?: string | null;
  /** Explicit category-icon override (used instead of the derived one). */
  icon?: IconName;
  style?: ViewStyle;
};

/**
 * A stand-in for a food photo. If `imageUrl` is provided it shows the real
 * picture; otherwise it renders a soft category-tinted gradient tile with a
 * duotone category icon (e.g. bowl, salad, pizza), so lists read as varied,
 * appetising imagery rather than a wall of identical placeholders.
 */
export function Thumb({ size = 56, radius = theme.radius.lg, name, imageUrl, icon, style }: Props) {
  const tile = foodTile(name);

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[styles.box, { width: size, height: size, borderRadius: radius }, style] as StyleProp<ImageStyle>}
        resizeMode="cover"
      />
    );
  }

  return (
    <LinearGradient
      colors={tile.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.box, { width: size, height: size, borderRadius: radius }, style]}
    >
      <Icon name={icon ?? tile.icon} size={Math.round(size * 0.46)} color={tile.base} weight="duotone" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: theme.color.blushMist,
  },
});
