import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Text } from '@/components/Text';

import { cardShadow, theme, withAlpha } from '@/theme';

type Kind = 'height' | 'weight';
type Unit = 'metric' | 'imperial';

type Props = {
  kind: Kind;
  label: string;
  emoji: string;
  tint?: string;
  /** Canonical value the app stores: cm for height, kg for weight (as a string). */
  value: string;
  onChange: (canonical: string) => void;
};

const round1 = (n: number) => Math.round(n * 10) / 10;

/** canonical (cm/kg) → the inputs shown for the selected unit. */
function toDisplay(kind: Kind, unit: Unit, canonical: string): { a: string; b: string } {
  const v = parseFloat(canonical);
  if (!canonical || Number.isNaN(v)) return { a: '', b: '' };
  if (kind === 'height') {
    if (unit === 'metric') return { a: String(Math.round(v)), b: '' };
    const totalIn = v / 2.54;
    const ft = Math.floor(totalIn / 12);
    return { a: String(ft), b: String(Math.round(totalIn - ft * 12)) };
  }
  if (unit === 'metric') return { a: String(round1(v)), b: '' };
  return { a: String(round1(v * 2.20462)), b: '' };
}

/** The unit inputs → the canonical (cm/kg) value the app stores. */
function toCanonical(kind: Kind, unit: Unit, a: string, b: string): string {
  const av = parseFloat(a);
  const bv = parseFloat(b);
  if (kind === 'height') {
    if (unit === 'metric') return a && !Number.isNaN(av) ? String(Math.round(av)) : '';
    if (!a && !b) return '';
    const ft = Number.isNaN(av) ? 0 : av;
    const inch = Number.isNaN(bv) ? 0 : bv;
    return String(Math.round(ft * 30.48 + inch * 2.54));
  }
  if (unit === 'metric') return a && !Number.isNaN(av) ? String(round1(av)) : '';
  return a && !Number.isNaN(av) ? String(round1(av / 2.20462)) : '';
}

/**
 * A height/weight input that lets you enter the value in either unit system
 * (cm ⇄ ft/in, kg ⇄ lb) while the app always stores the metric canonical value.
 * Used on the onboarding "About you" step.
 */
export function MeasureField({ kind, label, emoji, tint = theme.color.pink, value, onChange }: Props) {
  const [unit, setUnit] = useState<Unit>('metric');
  const seed = toDisplay(kind, 'metric', value);
  const [a, setA] = useState(seed.a);
  const [b, setB] = useState(seed.b);

  const units: { label: string; value: Unit }[] =
    kind === 'height'
      ? [{ label: 'cm', value: 'metric' }, { label: 'ft/in', value: 'imperial' }]
      : [{ label: 'kg', value: 'metric' }, { label: 'lb', value: 'imperial' }];

  const switchUnit = (next: Unit) => {
    if (next === unit) return;
    const disp = toDisplay(kind, next, toCanonical(kind, unit, a, b));
    setA(disp.a);
    setB(disp.b);
    setUnit(next);
  };

  const onA = (t: string) => {
    setA(t);
    onChange(toCanonical(kind, unit, t, b));
  };
  const onB = (t: string) => {
    setB(t);
    onChange(toCanonical(kind, unit, a, t));
  };

  const imperialHeight = kind === 'height' && unit === 'imperial';
  const suffix = kind === 'height' ? 'cm' : unit === 'metric' ? 'kg' : 'lb';

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={[styles.iconWrap, { backgroundColor: withAlpha(tint, 0x1f) }]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.toggle}>
          {units.map((u) => {
            const on = u.value === unit;
            return (
              <Pressable
                key={u.value}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                onPress={() => switchUnit(u.value)}
                style={[styles.seg, on && { backgroundColor: tint }]}
              >
                <Text style={[styles.segText, on && styles.segTextOn]}>{u.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.inputs}>
        {imperialHeight ? (
          <>
            <InputBox value={a} onChangeText={onA} placeholder="5" suffix="ft" />
            <InputBox value={b} onChangeText={onB} placeholder="9" suffix="in" />
          </>
        ) : (
          <InputBox
            value={a}
            onChangeText={onA}
            placeholder={kind === 'height' ? '175' : '75'}
            suffix={suffix}
          />
        )}
      </View>
    </View>
  );
}

function InputBox({
  value,
  onChangeText,
  placeholder,
  suffix,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  suffix: string;
}) {
  return (
    <View style={styles.inputBox}>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.color.textSecondary}
      />
      <Text style={styles.suffix}>{suffix}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.color.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    ...cardShadow(),
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  iconWrap: { width: 38, height: 38, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 20 },
  label: { flex: 1, fontSize: theme.fontSize.body, color: theme.color.textPrimary, fontWeight: '600' },
  toggle: { flexDirection: 'row', backgroundColor: theme.color.blush, borderRadius: theme.radius.pill, padding: 3, gap: 2 },
  seg: { borderRadius: theme.radius.pill, paddingHorizontal: 12, paddingVertical: 5 },
  segText: { fontSize: theme.fontSize.caption, fontWeight: '700', color: theme.color.textSecondary },
  segTextOn: { color: theme.color.textOnPink },
  inputs: { flexDirection: 'row', gap: theme.spacing.sm },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    backgroundColor: theme.color.background,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    textAlign: 'right',
    fontSize: theme.fontSize.subtitle,
    fontFamily: theme.fontFamily.bold,
    color: theme.color.textPrimary,
    paddingVertical: 2,
  },
  suffix: { fontSize: theme.fontSize.body, color: theme.color.textSecondary, fontWeight: '600' },
});
