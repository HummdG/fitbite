import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { theme } from '@/theme';

type Props = TextInputProps & { label: string };

export function Field({ label, style, ...props }: Props) {
  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.color.textSecondary}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: theme.fontSize.body,
    color: theme.color.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: theme.color.card,
    borderColor: theme.color.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
    fontSize: theme.fontSize.subtitle,
    color: theme.color.textPrimary,
  },
});
