import { Pressable, StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

type Props = {
  value: boolean;
  onValueChange?: (next: boolean) => void;
  disabled?: boolean;
};

/** A pill switch — green when on — used for the Profile dashboard-widget toggles. */
export function Toggle({ value, onValueChange, disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled || !onValueChange}
      onPress={() => onValueChange?.(!value)}
      style={[
        styles.track,
        { backgroundColor: value ? theme.color.success : '#D9D2DE' },
        disabled && { opacity: 0.45 },
      ]}
    >
      <View style={[styles.knob, value ? styles.knobOn : styles.knobOff]} />
    </Pressable>
  );
}

const W = 46;
const H = 28;
const KNOB = 22;
const styles = StyleSheet.create({
  track: { width: W, height: H, borderRadius: theme.radius.pill, padding: (H - KNOB) / 2, justifyContent: 'center' },
  knob: {
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: theme.color.white,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  knobOn: { alignSelf: 'flex-end' },
  knobOff: { alignSelf: 'flex-start' },
});
