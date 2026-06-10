import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import { Button, Card, ChipGroup, ScreenContainer } from '@/components';
import { useSession } from '@/features/auth/useSession';
import { useOnboarding } from '@/features/onboarding/store';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { theme } from '@/theme';
import type { Goal, Strictness } from '@/types/api';

const GOALS: { label: string; value: Goal }[] = [
  { label: 'Lose weight', value: 'lose_weight' },
  { label: 'Gain weight', value: 'gain_weight' },
  { label: 'Eat healthier', value: 'eat_healthier' },
  { label: 'High protein', value: 'high_protein' },
];

const STRICTNESS: { label: string; value: Strictness }[] = [
  { label: 'Relaxed', value: 'relaxed' },
  { label: 'Balanced', value: 'balanced' },
  { label: 'Strict', value: 'strict' },
];

export default function GoalStep() {
  const { draft, update } = useOnboarding();
  const { session } = useSession();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  const onFinish = async () => {
    if (!draft.goal) {
      Alert.alert('Pick a goal', 'Choose what you want FitBite to optimise for.');
      return;
    }
    const userId = session?.user?.id;
    if (!userId || !draft.gender || !draft.activity_level) {
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

      const allergies = draft.allergies
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        gender: draft.gender,
        age: Number(draft.age),
        height_cm: Number(draft.height_cm),
        current_weight_kg: Number(draft.current_weight_kg),
        target_weight_kg: draft.target_weight_kg ? Number(draft.target_weight_kg) : null,
        activity_level: draft.activity_level,
        goal: draft.goal,
        strictness: draft.strictness,
        dietary_prefs: draft.dietary_prefs,
        allergies,
        calorie_target: targets.calorie_target,
        protein_target_g: targets.protein_target_g,
        fibre_target_g: targets.fibre_target_g,
      });
      if (error) throw error;

      await qc.invalidateQueries({ queryKey: ['profile', userId] });
      // The AuthGate redirects to /today once the profile exists.
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Make sure the FitBite service is running.';
      Alert.alert('Could not save your goals', message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Your goal</Text>
      <Text style={styles.sub}>FitBite tunes its recommendations to this.</Text>

      <ChipGroup label="I want to…" options={GOALS} value={draft.goal} onChange={(v) => update({ goal: v as Goal })} />

      <ChipGroup
        label="How strict should we be?"
        options={STRICTNESS}
        value={draft.strictness}
        onChange={(v) => update({ strictness: v as Strictness })}
      />

      <Card style={{ marginBottom: theme.spacing.lg }}>
        <Text style={styles.note}>
          Strictness only changes how harshly over-budget dishes are scored — your calorie, protein and
          fibre targets stay the same.
        </Text>
      </Card>

      <Button title="Calculate my targets" onPress={onFinish} loading={busy} disabled={!draft.goal} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: theme.fontSize.title, fontWeight: '700', color: theme.color.textPrimary, marginTop: theme.spacing.md },
  sub: { fontSize: theme.fontSize.body, color: theme.color.textSecondary, marginBottom: theme.spacing.lg },
  note: { color: theme.color.textSecondary, fontSize: theme.fontSize.body, lineHeight: 20 },
});
