import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/theme';
import { useResponsive } from '@/theme/useResponsive';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
};

/** Safe-area + brand background + responsive padding + tablet max-width centering. */
export function ScreenContainer({ children, scroll = true, style }: Props) {
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
        style,
      ]}
    >
      {children}
    </View>
  );

  if (!scroll) {
    return <View style={[styles.root, { paddingTop: insets.top }]}>{inner}</View>;
  }
  return (
    <ScrollView
      style={[styles.root, { paddingTop: insets.top }]}
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
