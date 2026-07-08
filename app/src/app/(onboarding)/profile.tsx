import { Alert, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { useRouter } from 'expo-router';

import { Button, ChipGroup, Field, FieldRow, MeasureField, ScreenContainer, SelectCard, Stepper } from '@/components';
import { confirmSignOut } from '@/features/auth/useSession';
import { useOnboarding } from '@/features/onboarding/store';
import { theme } from '@/theme';
import type { ActivityLevel, Gender } from '@/types/api';

const GENDERS: { label: string; value: Gender; icon: 'female' | 'male' }[] = [
  { label: 'Female', value: 'female', icon: 'female' },
  { label: 'Male', value: 'male', icon: 'male' },
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
      <Stepper step={2} total={4} onLogout={confirmSignOut} />
      <Text style={styles.title}>About you</Text>
      <Text style={styles.sub}>Help us personalise your targets.</Text>

      <Text style={styles.fieldLabel}>Gender</Text>
      <View style={styles.genderRow}>
        {GENDERS.map((g) => (
          <SelectCard
            key={g.value}
            icon={g.icon}
            label={g.label}
            selected={draft.gender === g.value}
            onPress={() => update({ gender: g.value })}
          />
        ))}
      </View>

      <View style={styles.fields}>
        <FieldRow icon="age" label="Age" tint={theme.color.pink} keyboardType="number-pad" value={draft.age} onChangeText={(v) => update({ age: v })} placeholder="30" />
        <MeasureField kind="height" icon="height" label="Height" tint={theme.color.indigo} value={draft.height_cm} onChange={(v) => update({ height_cm: v })} />
        <MeasureField kind="weight" icon="weight" label="Current weight" tint={theme.color.macro.fibre} value={draft.current_weight_kg} onChange={(v) => update({ current_weight_kg: v })} />
        <MeasureField kind="weight" icon="flag" label="Target weight" tint={theme.color.berry} value={draft.target_weight_kg} onChange={(v) => update({ target_weight_kg: v })} />
      </View>

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
        label="Allergies (optional)"
        value={draft.allergies}
        onChangeText={(v) => update({ allergies: v })}
        placeholder="e.g. peanut, shellfish"
      />

      <Button title="Continue" onPress={onContinue} style={{ marginTop: theme.spacing.md }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: theme.fontSize.headline, fontWeight: '800', color: theme.color.textPrimary },
  sub: { fontSize: theme.fontSize.body, color: theme.color.textSecondary, marginBottom: theme.spacing.lg },
  fieldLabel: { fontSize: theme.fontSize.body, color: theme.color.textSecondary, marginBottom: 8, fontWeight: '600' },
  genderRow: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  fields: { gap: theme.spacing.sm, marginBottom: theme.spacing.md },
});
