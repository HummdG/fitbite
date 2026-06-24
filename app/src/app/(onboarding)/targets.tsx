import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

import { Button, ScreenContainer, SelectCard, Stepper, TargetRow } from '@/components';
import type { IconName } from '@/components';
import { useSession } from '@/features/auth/useSession';
import { useOnboarding } from '@/features/onboarding/store';
import { supabase } from '@/lib/supabase';
import { theme } from '@/theme';
import type { MacroKey } from '@/types/api';

// Data-backed widgets map to a MacroKey; the rest are shown to match the mockup
// but disabled until there's a data source for them.
type Widget = { key: string; macro?: MacroKey; label: string; icon: IconName; color: string };
const WIDGETS: Widget[] = [
  { key: 'calories', macro: 'calories', label: 'Calories', icon: 'calories', color: theme.color.macro.calories },
  { key: 'protein', macro: 'protein', label: 'Protein', icon: 'protein', color: theme.color.macro.protein },
  { key: 'fibre', macro: 'fibre', label: 'Fibre', icon: 'fibre', color: theme.color.macro.fibre },
  { key: 'carbs', macro: 'carbs', label: 'Carbs', icon: 'carbs', color: theme.color.macro.carbs },
  { key: 'fat', macro: 'fat', label: 'Fat', icon: 'fat', color: theme.color.macro.fat },
  { key: 'water', label: 'Water', icon: 'water', color: theme.color.indigo },
  { key: 'weight', label: 'Weight', icon: 'weight', color: theme.color.berry },
  { key: 'steps', label: 'Steps', icon: 'steps', color: theme.color.macro.fibre },
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
        <Stepper step={4} total={4} onBack={() => router.back()} />
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
      <Stepper step={4} total={4} onBack={() => router.back()} />
      <Text style={styles.title}>Your targets</Text>
      <Text style={styles.sub}>Here are your daily targets.</Text>

      <View style={styles.targets}>
        <TargetRow icon="calories" label="Calories" value={targets.calorie_target} unit="kcal" color={theme.color.macro.calories} barColor={theme.color.pink} progress={1} />
        <TargetRow icon="protein" label="Protein" value={targets.protein_target_g} unit="g" color={theme.color.macro.protein} barColor={theme.color.pink} progress={1} />
        <TargetRow icon="fibre" label="Fibre" value={targets.fibre_target_g} unit="g" color={theme.color.macro.fibre} barColor={theme.color.pink} progress={1} />
      </View>

      <Text style={styles.section}>Choose what appears on your dashboard</Text>
      <Text style={styles.sectionSub}>You can change this later in Profile.</Text>
      <View style={styles.grid}>
        {WIDGETS.map((w) => (
          <View key={w.key} style={styles.cell}>
            <SelectCard
              icon={w.icon}
              label={w.label}
              tint={w.color}
              checkbox
              disabled={!w.macro}
              selected={!!w.macro && draft.dashboard_widgets.includes(w.macro)}
              onPress={() => w.macro && toggleWidget(w.macro)}
            />
          </View>
        ))}
      </View>

      <Button title="Finish setup" onPress={onFinish} loading={busy} style={{ marginTop: theme.spacing.xl }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: theme.fontSize.headline, fontWeight: '800', color: theme.color.textPrimary },
  sub: { fontSize: theme.fontSize.body, color: theme.color.textSecondary, marginBottom: theme.spacing.lg },
  targets: { gap: theme.spacing.md },
  section: { fontSize: theme.fontSize.subtitle, fontWeight: '700', color: theme.color.textPrimary, marginTop: theme.spacing.xl },
  sectionSub: { fontSize: theme.fontSize.caption, color: theme.color.textSecondary, marginBottom: theme.spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: theme.spacing.md },
  cell: { width: '31%' },
});
