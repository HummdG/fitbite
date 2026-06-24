import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, ViewStyle } from 'react-native';

import { keyShadow, theme } from '@/theme';
import { Text } from './Text';

type Variant = 'primary' | 'secondary';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
}: Props) {
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  if (isPrimary) {
    const fg = isDisabled ? '#FFFFFFCC' : theme.color.textOnPink;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.outer,
          { alignSelf: fullWidth ? 'stretch' : 'flex-start' },
          !isDisabled && keyShadow(),
          { opacity: pressed && !isDisabled ? 0.92 : 1 },
          style,
        ]}
      >
        <LinearGradient
          colors={
            (isDisabled
              ? [theme.color.blushPink, theme.color.blushPink]
              : theme.gradient.cta) as [string, string, ...string[]]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.btn}
        >
          {loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.label, { color: fg }]}>{title}</Text>}
        </LinearGradient>
      </Pressable>
    );
  }

  // Secondary — quiet white fill with a hairline border and plum text.
  const fg = theme.color.plumShadow;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.btn,
        styles.secondary,
        { opacity: isDisabled ? 0.5 : pressed ? 0.9 : 1, alignSelf: fullWidth ? 'stretch' : 'flex-start' },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.label, { color: fg }]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: { borderRadius: theme.radius.pill },
  btn: {
    borderRadius: theme.radius.pill,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  secondary: {
    backgroundColor: theme.color.white,
    borderWidth: 1.5,
    borderColor: theme.color.border,
  },
  label: { fontSize: theme.fontSize.subtitle, fontWeight: '700' },
});
