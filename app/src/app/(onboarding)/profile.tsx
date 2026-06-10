import { Alert, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, ChipGroup, Field, ScreenContainer } from '@/components';
import { useOnboarding } from '@/features/onboarding/store';
import { theme } from '@/theme';
import type { ActivityLevel, Gender } from '@/types/api';

const GENDERS: { label: string; value: Gender }[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
];

const ACTIVITY: { label: string; value: ActivityLevel }[] = [
  { label: 'Sedentary', value: 'sedentary' },
  { label: 'Light', value: 'light' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'Active', value: 'active' },
  { label: 'Very active', value: 'very_active' },
];

const DIET_PREFS = [
  'halal', 'vegetarian', 'vegan', 'pescatarian', 'no_pork', 'dairy_free', 'gluten_free',
].map((v) => ({ label: v.replace('_', ' '), value: v }));

export default function ProfileStep() {
  const { draft, update } = useOnboarding();
  const router = useRouter();

  const onContinue = () => {
    if (!draft.gender || !draft.activity_level) {
      Alert.alert('Almost there', 'Please choose your gender and activity level.');
      return;
    }
    if (!draft.age || !draft.height_cm || !draft.current_weight_kg) {
      Alert.alert('Almost there', 'Please fill in age, height and current weight.');
      return;
    }
    router.push('/goal');
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>About you</Text>
      <Text style={styles.sub}>We use this to estimate your daily targets.</Text>

      <ChipGroup label="Gender" options={GENDERS} value={draft.gender} onChange={(v) => update({ gender: v as Gender })} />

      <Field label="Age" keyboardType="number-pad" value={draft.age} onChangeText={(v) => update({ age: v })} placeholder="e.g. 30" />
      <Field label="Height (cm)" keyboardType="numeric" value={draft.height_cm} onChangeText={(v) => update({ height_cm: v })} placeholder="e.g. 175" />
      <Field label="Current weight (kg)" keyboardType="numeric" value={draft.current_weight_kg} onChangeText={(v) => update({ current_weight_kg: v })} placeholder="e.g. 80" />
      <Field label="Target weight (kg) — optional" keyboardType="numeric" value={draft.target_weight_kg} onChangeText={(v) => update({ target_weight_kg: v })} placeholder="e.g. 75" />

      <ChipGroup
        label="Activity level"
        options={ACTIVITY}
        value={draft.activity_level}
        onChange={(v) => update({ activity_level: v as ActivityLevel })}
      />

      <ChipGroup
        label="Dietary preferences (optional)"
        options={DIET_PREFS}
        value={draft.dietary_prefs}
        onChange={(v) => update({ dietary_prefs: v as string[] })}
        multi
      />

      <Field
        label="Allergies (optional, comma-separated)"
        value={draft.allergies}
        onChangeText={(v) => update({ allergies: v })}
        placeholder="e.g. peanut, shellfish"
      />

      <Button title="Continue" onPress={onContinue} style={{ marginTop: theme.spacing.md }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: theme.fontSize.title, fontWeight: '700', color: theme.color.textPrimary, marginTop: theme.spacing.md },
  sub: { fontSize: theme.fontSize.body, color: theme.color.textSecondary, marginBottom: theme.spacing.lg },
});
