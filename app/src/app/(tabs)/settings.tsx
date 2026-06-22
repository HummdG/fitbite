import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import { Button, Card, Icon, ScreenContainer, SegmentedControl, SelectCard, Thumb } from '@/components';
import type { IconName } from '@/components';
import { signOut, useSession } from '@/features/auth/useSession';
import { useProfile } from '@/features/profile/useProfile';
import { supabase } from '@/lib/supabase';
import { theme } from '@/theme';
import type { Goal, MacroKey } from '@/types/api';

const GOAL_LABEL: Record<Goal, string> = {
  lose_weight: 'Lose weight',
  gain_weight: 'Gain muscle',
  eat_healthier: 'Eat healthier',
  high_protein: 'High protein',
};

const WIDGETS: { key: MacroKey; label: string; icon: IconName }[] = [
  { key: 'calories', label: 'Calories', icon: 'calories' },
  { key: 'protein', label: 'Protein', icon: 'protein' },
  { key: 'carbs', label: 'Carbs', icon: 'carbs' },
  { key: 'fat', label: 'Fat', icon: 'fat' },
];

const DEFAULT_WIDGETS: MacroKey[] = ['calories', 'protein', 'carbs', 'fat'];

export default function Profile() {
  const { session } = useSession();
  const userId = session?.user?.id;
  const { data: profile } = useProfile(userId);
  const qc = useQueryClient();
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');

  const email = session?.user?.email ?? '';
  const name = email ? email.split('@')[0].replace(/[._]/g, ' ') : 'there';
  const widgets = profile?.dashboard_widgets?.length ? profile.dashboard_widgets : DEFAULT_WIDGETS;

  const toggleWidget = async (key: MacroKey) => {
    if (!userId) return;
    const has = widgets.includes(key);
    const next = has ? widgets.filter((w) => w !== key) : [...widgets, key];
    await supabase
      .from('profiles')
      .update({ dashboard_widgets: next.length ? next : ['calories'] })
      .eq('id', userId);
    qc.invalidateQueries({ queryKey: ['profile', userId] });
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Thumb size={64} radius={32} icon="person" />
        <View style={{ flex: 1 }}>
          <Text style={styles.hey} numberOfLines={1}>
            Hey {name} 👋
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {email || '—'}
          </Text>
        </View>
      </View>

      <Text style={styles.section}>Your plan</Text>
      <Card style={{ marginBottom: theme.spacing.lg }}>
        <Row label="Goal" value={profile ? GOAL_LABEL[profile.goal] : '—'} />
        <Row label="Strictness" value={profile?.strictness ?? '—'} />
        <Row label="Diet" value={profile?.dietary_prefs?.length ? profile.dietary_prefs.join(', ') : 'None'} last />
      </Card>

      <Text style={styles.section}>Daily targets</Text>
      <Card style={{ marginBottom: theme.spacing.lg }}>
        <Row label="Calories" value={profile ? `${profile.calorie_target} kcal` : '—'} />
        <Row label="Protein" value={profile ? `${profile.protein_target_g} g` : '—'} />
        <Row label="Carbs" value={profile ? `${profile.carbs_target_g} g` : '—'} />
        <Row label="Fat" value={profile ? `${profile.fat_target_g} g` : '—'} last />
      </Card>

      <Text style={styles.section}>Dashboard widgets</Text>
      <View style={styles.grid}>
        {WIDGETS.map((w) => (
          <SelectCard key={w.key} icon={w.icon} label={w.label} selected={widgets.includes(w.key)} onPress={() => toggleWidget(w.key)} />
        ))}
      </View>

      <Text style={styles.section}>Units</Text>
      <View style={{ marginBottom: theme.spacing.xl }}>
        <SegmentedControl
          options={[
            { label: 'Metric (kg/cm)', value: 'metric' },
            { label: 'Imperial (lb/in)', value: 'imperial' },
          ]}
          value={units}
          onChange={setUnits}
        />
      </View>

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
  header: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginTop: theme.spacing.md, marginBottom: theme.spacing.xl },
  hey: { fontSize: theme.fontSize.title, fontWeight: '700', color: theme.color.textPrimary, textTransform: 'capitalize' },
  email: { fontSize: theme.fontSize.body, color: theme.color.textSecondary, marginTop: 2 },
  section: { fontSize: theme.fontSize.subtitle, fontWeight: '700', color: theme.color.textPrimary, marginBottom: theme.spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md, marginBottom: theme.spacing.xl },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: theme.color.border },
  rowLabel: { color: theme.color.textSecondary, fontSize: theme.fontSize.body },
  rowValue: { color: theme.color.textPrimary, fontSize: theme.fontSize.body, fontWeight: '600', flexShrink: 1, textAlign: 'right', marginLeft: theme.spacing.md, textTransform: 'capitalize' },
});
