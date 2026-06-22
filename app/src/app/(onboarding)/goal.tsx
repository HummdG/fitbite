import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { useRouter } from 'expo-router';

import { Button, Card, ScreenContainer, SegmentedControl, SelectCard, Stepper } from '@/components';
import type { IconName } from '@/components';
import { useOnboarding } from '@/features/onboarding/store';
import { api } from '@/lib/api';
import { theme } from '@/theme';
import type { Goal, Strictness } from '@/types/api';

const GOALS: { label: string; value: Goal; icon: IconName }[] = [
  { label: 'Lose weight', value: 'lose_weight', icon: 'loseWeight' },
  { label: 'Gain muscle', value: 'gain_weight', icon: 'muscle' },
  { label: 'Eat healthier', value: 'eat_healthier', icon: 'leaf' },
  { label: 'High protein', value: 'high_protein', icon: 'protein' },
];

const STRICTNESS: { label: string; value: Strictness }[] = [
  { label: 'Relaxed', value: 'relaxed' },
  { label: 'Balanced', value: 'balanced' },
  { label: 'Strict', value: 'strict' },
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

  return (
    <ScreenContainer>
      <Stepper step={3} total={4} label="Your goal" />
      <Text style={styles.title}>Your goal</Text>
      <Text style={styles.sub}>What should FitBite focus on?</Text>

      <View style={styles.grid}>
        {GOALS.map((g) => (
          <SelectCard
            key={g.value}
            icon={g.icon}
            label={g.label}
            selected={draft.goal === g.value}
            onPress={() => update({ goal: g.value })}
          />
        ))}
      </View>

      <Text style={styles.section}>How strict should we be?</Text>
      <SegmentedControl options={STRICTNESS} value={draft.strictness} onChange={(v) => update({ strictness: v })} />

      <Card style={{ marginTop: theme.spacing.lg, marginBottom: theme.spacing.lg }}>
        <Text style={styles.note}>
          Strictness only changes how harshly over-budget dishes are scored — your calorie, protein, carbs
          and fat targets stay the same.
        </Text>
      </Card>

      <Button title="Calculate my targets" onPress={onCalculate} loading={busy} disabled={!draft.goal} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: theme.fontSize.title, fontWeight: '700', color: theme.color.textPrimary },
  sub: { fontSize: theme.fontSize.body, color: theme.color.textSecondary, marginBottom: theme.spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
  section: { fontSize: theme.fontSize.subtitle, fontWeight: '700', color: theme.color.textPrimary, marginTop: theme.spacing.xl, marginBottom: theme.spacing.md },
  note: { color: theme.color.textSecondary, fontSize: theme.fontSize.body, lineHeight: 20 },
});
