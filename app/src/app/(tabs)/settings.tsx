import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { useQueryClient } from '@tanstack/react-query';

import { Card, Icon, IconName, ScreenContainer, Toggle } from '@/components';
import { signOut, useSession } from '@/features/auth/useSession';
import { useProfile } from '@/features/profile/useProfile';
import { supabase } from '@/lib/supabase';
import { theme, withAlpha } from '@/theme';
import type { Goal, MacroKey } from '@/types/api';

const GOAL_LABEL: Record<Goal, string> = {
  lose_weight: 'Lose weight',
  gain_weight: 'Gain weight',
  eat_healthier: 'Eat healthier',
  high_protein: 'High protein',
};

const STRICTNESS_LABEL: Record<string, string> = { relaxed: 'Relaxed', balanced: 'Balanced', strict: 'Strict' };

const GOAL_ROWS: { key: 'calorie_target' | 'protein_target_g' | 'fibre_target_g'; label: string; icon: IconName; unit: string; color: string }[] = [
  { key: 'calorie_target', label: 'Calories', icon: 'calories', unit: 'kcal/day', color: theme.color.macro.calories },
  { key: 'protein_target_g', label: 'Protein', icon: 'protein', unit: 'g/day', color: theme.color.macro.protein },
  { key: 'fibre_target_g', label: 'Fibre', icon: 'fibre', unit: 'g/day', color: theme.color.macro.fibre },
];

type Widget = { key: string; macro?: MacroKey; label: string };
const WIDGETS: Widget[] = [
  { key: 'calories', macro: 'calories', label: 'Calories' },
  { key: 'protein', macro: 'protein', label: 'Protein' },
  { key: 'fibre', macro: 'fibre', label: 'Fibre' },
  { key: 'carbs', macro: 'carbs', label: 'Carbs' },
  { key: 'fat', macro: 'fat', label: 'Fat' },
  { key: 'water', label: 'Water' },
  { key: 'steps', label: 'Steps' },
  { key: 'weight', label: 'Weight' },
];

const DEFAULT_WIDGETS: MacroKey[] = ['calories', 'protein', 'fibre'];

export default function Profile() {
  const { session } = useSession();
  const userId = session?.user?.id;
  const { data: profile } = useProfile(userId);
  const qc = useQueryClient();

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

  const confirmSignOut = () =>
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);

  return (
    <ScreenContainer>
      <View style={styles.topRow}>
        <Text style={styles.title}>Profile</Text>
        <Pressable onPress={confirmSignOut} hitSlop={10} accessibilityRole="button" accessibilityLabel="Sign out">
          <Icon name="logout" size={24} color={theme.color.textSecondary} />
        </Pressable>
      </View>
      <Text style={styles.hey} numberOfLines={1}>
        Hey {name}! 👋
      </Text>
      <Text style={styles.sub}>Let&apos;s keep making smart choices.</Text>

      <Text style={styles.section}>Your goals</Text>
      <Card style={styles.cardGap}>
        {GOAL_ROWS.map((g, i) => (
          <View key={g.key} style={[styles.goalRow, i < GOAL_ROWS.length - 1 && styles.divider]}>
            <View style={[styles.goalIcon, { backgroundColor: withAlpha(g.color, 0x1f) }]}>
              <Icon name={g.icon} size={18} color={g.color} />
            </View>
            <Text style={styles.goalLabel}>{g.label}</Text>
            <Text style={styles.goalValue}>
              {profile ? `${profile[g.key].toLocaleString()} ${g.unit}` : '—'}
            </Text>
          </View>
        ))}
      </Card>

      <Text style={styles.section}>Preferences</Text>
      <Card style={styles.cardGap}>
        <Row label="Diet" value={profile?.dietary_prefs?.length ? profile.dietary_prefs.map(pretty).join(' · ') : 'None'} />
        <Row label="Strictness" value={profile ? STRICTNESS_LABEL[profile.strictness] ?? profile.strictness : '—'} last />
      </Card>

      <Text style={styles.section}>Dashboard widgets</Text>
      <Text style={styles.sectionSub}>Choose what appears on your Today dashboard.</Text>
      <View style={styles.widgetGrid}>
        {WIDGETS.map((w) => {
          const on = !!w.macro && widgets.includes(w.macro);
          return (
            <View key={w.key} style={styles.widgetCell}>
              <Text style={[styles.widgetLabel, !w.macro && styles.widgetLabelOff]}>{w.label}</Text>
              <Toggle value={on} disabled={!w.macro} onValueChange={w.macro ? () => toggleWidget(w.macro!) : undefined} />
            </View>
          );
        })}
      </View>
    </ScreenContainer>
  );
}

function pretty(s: string) {
  return s.replace(/_/g, ' ');
}

function Row({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.divider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: theme.spacing.md },
  title: { fontSize: theme.fontSize.headline, fontWeight: '800', color: theme.color.textPrimary },
  hey: { fontSize: theme.fontSize.title, fontWeight: '800', color: theme.color.textPrimary, textTransform: 'capitalize', marginTop: theme.spacing.sm },
  sub: { fontSize: theme.fontSize.body, color: theme.color.textSecondary, marginBottom: theme.spacing.xl },
  section: { fontSize: theme.fontSize.subtitle, fontWeight: '700', color: theme.color.textPrimary, marginBottom: theme.spacing.sm },
  sectionSub: { fontSize: theme.fontSize.caption, color: theme.color.textSecondary, marginBottom: theme.spacing.md, marginTop: -2 },
  cardGap: { marginBottom: theme.spacing.xl, paddingVertical: 4 },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, paddingVertical: 12 },
  goalIcon: { width: 36, height: 36, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center' },
  goalLabel: { flex: 1, fontSize: theme.fontSize.body, color: theme.color.textPrimary, fontWeight: '600' },
  goalValue: { fontSize: theme.fontSize.body, color: theme.color.textPrimary, fontWeight: '700' },
  divider: { borderBottomWidth: 1, borderBottomColor: theme.color.border },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  rowLabel: { color: theme.color.textSecondary, fontSize: theme.fontSize.body },
  rowValue: { color: theme.color.textPrimary, fontSize: theme.fontSize.body, fontWeight: '600', flexShrink: 1, textAlign: 'right', marginLeft: theme.spacing.md, textTransform: 'capitalize' },
  widgetGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: theme.spacing.lg },
  widgetCell: { width: '47%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  widgetLabel: { fontSize: theme.fontSize.body, color: theme.color.textPrimary, fontWeight: '600' },
  widgetLabelOff: { color: theme.color.textSecondary },
});
