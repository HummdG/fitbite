import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, ScreenContainer } from '@/components';
import { signOut, useSession } from '@/features/auth/useSession';
import { useProfile } from '@/features/profile/useProfile';
import { theme } from '@/theme';
import type { Goal } from '@/types/api';

const GOAL_LABEL: Record<Goal, string> = {
  lose_weight: 'Lose weight',
  gain_weight: 'Gain weight',
  eat_healthier: 'Eat healthier',
  high_protein: 'High protein',
};

export default function Settings() {
  const { session } = useSession();
  const { data: profile } = useProfile(session?.user?.id);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Profile</Text>

      <Card style={{ marginBottom: theme.spacing.lg }}>
        <Row label="Email" value={session?.user?.email ?? '—'} />
        <Row label="Goal" value={profile ? GOAL_LABEL[profile.goal] : '—'} />
        <Row label="Strictness" value={profile?.strictness ?? '—'} />
        <Row label="Diet" value={profile?.dietary_prefs?.length ? profile.dietary_prefs.join(', ') : 'None'} last />
      </Card>

      <Text style={styles.section}>Daily targets</Text>
      <Card style={{ marginBottom: theme.spacing.xl }}>
        <Row label="Calories" value={profile ? `${profile.calorie_target} kcal` : '—'} />
        <Row label="Protein" value={profile ? `${profile.protein_target_g} g` : '—'} />
        <Row label="Fibre" value={profile ? `${profile.fibre_target_g} g` : '—'} last />
      </Card>

      <Button title="Sign out" variant="secondary" onPress={() => signOut()} />
    </ScreenContainer>
  );
}

function Row({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowDivider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: theme.fontSize.title, fontWeight: '700', color: theme.color.textPrimary, marginTop: theme.spacing.md, marginBottom: theme.spacing.lg },
  section: { fontSize: theme.fontSize.subtitle, fontWeight: '700', color: theme.color.textPrimary, marginBottom: theme.spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: theme.color.border },
  rowLabel: { color: theme.color.textSecondary, fontSize: theme.fontSize.body },
  rowValue: { color: theme.color.textPrimary, fontSize: theme.fontSize.body, fontWeight: '600', flexShrink: 1, textAlign: 'right', marginLeft: theme.spacing.md },
});
