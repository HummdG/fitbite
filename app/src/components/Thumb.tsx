import { StyleSheet, View, ViewStyle } from 'react-native';

import { theme } from '@/theme';
import { Icon, IconName } from './Icon';

type Props = {
  size?: number;
  radius?: number;
  icon?: IconName;
  style?: ViewStyle;
};

/**
 * Empty, brand-tinted thumbnail placeholder standing in for a food photo.
 * (Real imagery is intentionally deferred — see the redesign plan.)
 */
export function Thumb({ size = 56, radius = theme.radius.md, icon = 'restaurant', style }: Props) {
  return (
    <View
      style={[
        styles.box,
        { width: size, height: size, borderRadius: radius },
        style,
      ]}
    >
      <Icon name={icon} size={Math.round(size * 0.42)} color={theme.color.blushPink} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: theme.color.blushMist,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.color.border,
  },
});
