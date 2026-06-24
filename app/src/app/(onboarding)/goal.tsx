import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { useRouter } from 'expo-router';

import { Button, ScreenContainer, SelectCard, Stepper } from '@/components';
import type { IconName } from '@/components';
import { useOnboarding } from '@/features/onboarding/store';
import { api } from '@/lib/api';
import { theme } from '@/theme';
import type { Goal, Strictness } from '@/types/api';

const GOALS: { label: string; value: Goal; icon: IconName }[] = [
  { label: 'Lose weight', value: 'lose_weight', icon: 'loseWeight' },
  { label: 'Gain weight', value: 'gain_weight', icon: 'gainWeight' },
  { label: 'Eat healthier', value: 'eat_healthier', icon: 'leaf' },
  { label: 'High protein', value: 'high_protein', icon: 'protein' },
];

const STRICTNESS: { label: string; value: Strictness; icon: IconName; tint: string; note: string }[] = [
  { label: 'Relaxed', value: 'relaxed', icon: 'relaxed', tint: theme.color.macro.fibre, note: 'Relaxed gives you room to breathe — only the most over-budget dishes get marked down.' },
  { label: 'Balanced', value: 'balanced', icon: 'balanced', tint: theme.color.pink, note: 'Balanced is our most popular choice. It keeps you on track without being too rigid.' },
  { label: 'Strict', value: 'strict', icon: 'strict', tint: theme.color.berry, note: 'Strict scores dishes tightly against your targets — best when you want to stay precise.' },
];

export default function GoalStep() {
  const { draft, update } = useOnboarding();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onCalculate = async () => {
    if (!draft.goal) {
      Alert.alert('Pick a goal', 'Choose what you want FitBite to optimise for.');
      return;
    }
    if (!draft.gender || !draft.activity_level) {
      Alert.alert('Something went wrong', 'Please restart onboarding.');
      return;
    }

    setBusy(true);
    try {
      const targets = await api.computeTargets({
        gender: draft.gender,
        age: Number(draft.age),
        height_cm: Number(draft.height_cm),
        current_weight_kg: Number(draft.current_weight_kg),
        activity_level: draft.activity_level,
        goal: draft.goal,
      });
      update({ targets });
      router.push('/targets');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Make sure the FitBite service is running.';
      Alert.alert('Could not calculate targets', message);
    } finally {
      setBusy(false);
    }
  };

  const note = STRICTNESS.find((s) => s.value === draft.strictness)?.note;

  return (
    <ScreenContainer>
      <Stepper step={3} total={4} onBack={() => router.back()} />
      <Text style={styles.title}>Your goal</Text>
      <Text style={styles.sub}>What would you like to focus on?</Text>

      <View style={styles.goalGrid}>
        {GOALS.map((g) => (
          <View key={g.value} style={styles.goalCell}>
            <SelectCard
              icon={g.icon}
              label={g.label}
              selected={draft.goal === g.value}
              onPress={() => update({ goal: g.value })}
            />
          </View>
        ))}
      </View>

      <Text style={styles.section}>How strict should we be?</Text>
      <Text style={styles.sectionSub}>This changes how we score dishes, not your targets.</Text>
      <View style={styles.strictRow}>
        {STRICTNESS.map((s) => (
          <SelectCard
            key={s.value}
            icon={s.icon}
            label={s.label}
            tint={s.tint}
            selected={draft.strictness === s.value}
            onPress={() => update({ strictness: s.value })}
          />
        ))}
      </View>

      <View style={styles.note}>
        <Text style={styles.noteText}>{note}</Text>
      </View>

      <Button title="Calculate my targets" onPress={onCalculate} loading={busy} disabled={!draft.goal} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: theme.fontSize.headline, fontWeight: '800', color: theme.color.textPrimary },
  sub: { fontSize: theme.fontSize.body, color: theme.color.textSecondary, marginBottom: theme.spacing.lg },
  goalGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: theme.spacing.md },
  goalCell: { width: '48%' },
  section: { fontSize: theme.fontSize.subtitle, fontWeight: '700', color: theme.color.textPrimary, marginTop: theme.spacing.xl },
  sectionSub: { fontSize: theme.fontSize.caption, color: theme.color.textSecondary, marginBottom: theme.spacing.md },
  strictRow: { flexDirection: 'row', gap: theme.spacing.sm },
  note: {
    backgroundColor: theme.color.blush,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.lg,
  },
  noteText: { color: theme.color.textSecondary, fontSize: theme.fontSize.body, lineHeight: 21 },
});
