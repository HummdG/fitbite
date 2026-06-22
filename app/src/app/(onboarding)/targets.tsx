import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

import { Button, MacroStat, ScreenContainer, SelectCard, Stepper } from '@/components';
import type { IconName } from '@/components';
import { useSession } from '@/features/auth/useSession';
import { useOnboarding } from '@/features/onboarding/store';
import { supabase } from '@/lib/supabase';
import { theme } from '@/theme';
import type { MacroKey } from '@/types/api';

const WIDGETS: { key: MacroKey; label: string; icon: IconName; color: string }[] = [
  { key: 'calories', label: 'Calories', icon: 'calories', color: theme.color.macro.calories },
  { key: 'protein', label: 'Protein', icon: 'protein', color: theme.color.macro.protein },
  { key: 'carbs', label: 'Carbs', icon: 'carbs', color: theme.color.macro.carbs },
  { key: 'fat', label: 'Fat', icon: 'fat', color: theme.color.macro.fat },
];

export default function TargetsStep() {
  const { draft, update } = useOnboarding();
  const { session } = useSession();
  const qc = useQueryClient();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const targets = draft.targets;

  if (!targets) {
    return (
      <ScreenContainer>
        <Stepper step={4} total={4} label="Your targets" />
        <Text style={styles.sub}>Let&apos;s calculate your targets first.</Text>
        <Button title="Back to goal" onPress={() => router.replace('/goal')} />
      </ScreenContainer>
    );
  }

  const toggleWidget = (key: MacroKey) => {
    const has = draft.dashboard_widgets.includes(key);
    update({
      dashboard_widgets: has
        ? draft.dashboard_widgets.filter((w) => w !== key)
        : [...draft.dashboard_widgets, key],
    });
  };

  const onFinish = async () => {
    const userId = session?.user?.id;
    if (!userId || !draft.gender || !draft.activity_level || !draft.goal) {
      Alert.alert('Something went wrong', 'Please restart onboarding.');
      return;
    }

    setBusy(true);
    try {
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
        carbs_target_g: targets.carbs_target_g,
        fat_target_g: targets.fat_target_g,
        dashboard_widgets: draft.dashboard_widgets.length ? draft.dashboard_widgets : ['calories'],
      });
      if (error) throw error;

      await qc.invalidateQueries({ queryKey: ['profile', userId] });
      // The AuthGate redirects to /today once the profile exists.
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Please try again.';
      Alert.alert('Could not save your profile', message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer>
      <Stepper step={4} total={4} label="Your targets" />
      <Text style={styles.title}>Your targets</Text>
      <Text style={styles.sub}>Here are your personalised daily targets.</Text>

      <View style={styles.grid}>
        <MacroStat icon="calories" label="Calories" value={targets.calorie_target} unit="kcal" color={theme.color.macro.calories} />
        <MacroStat icon="protein" label="Protein" value={targets.protein_target_g} unit="g" color={theme.color.macro.protein} />
        <MacroStat icon="carbs" label="Carbs" value={targets.carbs_target_g} unit="g" color={theme.color.macro.carbs} />
        <MacroStat icon="fat" label="Fat" value={targets.fat_target_g} unit="g" color={theme.color.macro.fat} />
      </View>

      <Text style={styles.section}>Choose what appears on your dashboard</Text>
      <View style={styles.grid}>
        {WIDGETS.map((w) => (
          <SelectCard
            key={w.key}
            icon={w.icon}
            label={w.label}
            selected={draft.dashboard_widgets.includes(w.key)}
            onPress={() => toggleWidget(w.key)}
          />
        ))}
      </View>

      <Button title="Finish setup" onPress={onFinish} loading={busy} style={{ marginTop: theme.spacing.xl }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: theme.fontSize.title, fontWeight: '700', color: theme.color.textPrimary },
  sub: { fontSize: theme.fontSize.body, color: theme.color.textSecondary, marginBottom: theme.spacing.lg },
  section: { fontSize: theme.fontSize.subtitle, fontWeight: '700', color: theme.color.textPrimary, marginTop: theme.spacing.xl, marginBottom: theme.spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
});
