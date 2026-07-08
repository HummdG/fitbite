import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/theme';
import { useResponsive } from '@/theme/useResponsive';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  /** Override the full-bleed screen background (defaults to the brand background). */
  background?: string;
};

/** Safe-area + brand background + responsive padding + tablet max-width centering. */
export function ScreenContainer({ children, scroll = true, style, background }: Props) {
  const insets = useSafeAreaInsets();
  const { maxContentWidth } = useResponsive();

  const inner = (
    <View
      style={[
        {
          width: '100%',
          maxWidth: maxContentWidth,
          alignSelf: 'center',
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.lg,
          paddingBottom: theme.spacing.xxl,
        },
        // Non-scrolling screens fill the height so children can use flex
        // (e.g. Welcome's space-between layout). Scrolling content must not.
        !scroll && { flex: 1 },
        style,
      ]}
    >
      {children}
    </View>
  );

  const rootStyle = [styles.root, { paddingTop: insets.top }, background ? { backgroundColor: background } : null];

  if (!scroll) {
    return <View style={rootStyle}>{inner}</View>;
  }
  return (
    <ScrollView
      style={rootStyle}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      {inner}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.color.background },
});
