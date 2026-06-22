import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  Button,
  Card,
  Field,
  GradientHeader,
  Icon,
  MacroSummary,
  OptionRow,
  ScreenContainer,
  Thumb,
} from '@/components';
import type { MacroTargets } from '@/components';
import { useSession } from '@/features/auth/useSession';
import { useHistory } from '@/features/history/useHistory';
import { useProfile } from '@/features/profile/useProfile';
import { AddToTodayInput, useAddToToday, useRemoveFromToday, useToday } from '@/features/today/useToday';
import { theme } from '@/theme';
import type { FoodLogRow, MacroKey } from '@/types/api';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function prettyToday(): string {
  const d = new Date();
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** Consecutive days ending today that have at least one logged item. */
function computeStreak(byDate: Map<string, { rows: FoodLogRow[] }>): number {
  let streak = 0;
  const d = new Date();
  for (;;) {
    const y = d.getFullYear();
    const key = `${y}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (byDate.get(key)?.rows.length) {
      streak += 1;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}

const DEFAULT_WIDGETS: MacroKey[] = ['calories', 'protein', 'carbs', 'fat'];

export default function Today() {
  const router = useRouter();
  const { session } = useSession();
  const userId = session?.user?.id;
  const { data: profile } = useProfile(userId);
  const { data: today, isLoading } = useToday(userId);
  const { data: history } = useHistory(userId, 30);
  const add = useAddToToday(userId);
  const remove = useRemoveFromToday(userId);
  const [adding, setAdding] = useState(false);

  const totals = today?.totals ?? { calories: 0, protein_g: 0, fibre_g: 0, carbs_g: 0, fat_g: 0 };
  const targets: MacroTargets = {
    calorie_target: profile?.calorie_target ?? 0,
    protein_target_g: profile?.protein_target_g ?? 0,
    carbs_target_g: profile?.carbs_target_g ?? 0,
    fat_target_g: profile?.fat_target_g ?? 0,
    fibre_target_g: profile?.fibre_target_g ?? 0,
  };
  const widgets = profile?.dashboard_widgets?.length ? profile.dashboard_widgets : DEFAULT_WIDGETS;
  const streak = history ? computeStreak(history.byDate) : 0;

  return (
    <ScreenContainer>
      <GradientHeader style={{ marginBottom: theme.spacing.lg }}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.hello}>Today</Text>
            <Text style={styles.date}>{prettyToday()}</Text>
          </View>
          <View style={styles.streak}>
            <Icon name="flameFilled" size={18} color={theme.color.white} />
            <Text style={styles.streakText}>{streak}</Text>
          </View>
        </View>
      </GradientHeader>

      <Card style={{ marginBottom: theme.spacing.lg }}>
        <MacroSummary totals={totals} targets={targets} widgets={widgets} />
      </Card>

      <Text style={styles.section}>Quick actions</Text>
      <View style={{ gap: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
        <OptionRow icon="scan" title="Scan a menu" subtitle="Find the best dish for your goals" onPress={() => router.push('/scanner')} />
        <OptionRow icon="plus" title="Add food" subtitle="Log something manually" tint={theme.color.purple} onPress={() => setAdding(true)} />
      </View>

      <Text style={styles.section}>Today&apos;s log</Text>
      {isLoading ? (
        <Text style={styles.muted}>Loading…</Text>
      ) : today && today.rows.length > 0 ? (
        today.rows.map((r) => (
          <View key={r.id} style={styles.logRow}>
            <Thumb size={48} />
            <View style={styles.logMid}>
              <Text style={styles.logName} numberOfLines={1}>
                {r.name}
              </Text>
              <Text style={styles.logMacros}>
                {r.protein_g}g P · {r.carbs_g}g C · {r.fat_g}g F
              </Text>
            </View>
            <Text style={styles.logKcal}>{r.calories} kcal</Text>
            <Pressable onPress={() => remove.mutate(r.id)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Remove ${r.name}`}>
              <Icon name="trash" size={18} color={theme.color.textSecondary} />
            </Pressable>
          </View>
        ))
      ) : (
        <Text style={styles.muted}>Nothing logged yet. Scan a menu to get started.</Text>
      )}

      <AddFoodModal
        visible={adding}
        onClose={() => setAdding(false)}
        onSave={async (input) => {
          await add.mutateAsync(input);
          setAdding(false);
        }}
      />
    </ScreenContainer>
  );
}

function AddFoodModal({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (input: AddToTodayInput) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
  };

  const save = async () => {
    if (!name.trim() || !calories) return;
    setBusy(true);
    try {
      await onSave({
        name: name.trim(),
        calories: Number(calories) || 0,
        protein_g: Number(protein) || 0,
        carbs_g: Number(carbs) || 0,
        fat_g: Number(fat) || 0,
        fibre_g: 0,
      });
      reset();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Card style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Add food</Text>
            <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
              <Icon name="close" size={22} color={theme.color.textSecondary} />
            </Pressable>
          </View>
          <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Chicken wrap" />
          <Field label="Calories (kcal)" keyboardType="numeric" value={calories} onChangeText={setCalories} placeholder="e.g. 480" />
          <View style={styles.macroFields}>
            <View style={styles.macroInput}>
              <Field label="Protein (g)" keyboardType="numeric" value={protein} onChangeText={setProtein} placeholder="0" />
            </View>
            <View style={styles.macroInput}>
              <Field label="Carbs (g)" keyboardType="numeric" value={carbs} onChangeText={setCarbs} placeholder="0" />
            </View>
            <View style={styles.macroInput}>
              <Field label="Fat (g)" keyboardType="numeric" value={fat} onChangeText={setFat} placeholder="0" />
            </View>
          </View>
          <Button title="Add to Today" onPress={save} loading={busy} disabled={!name.trim() || !calories} />
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hello: { fontSize: theme.fontSize.title, fontWeight: '700', color: theme.color.white },
  date: { fontSize: theme.fontSize.body, color: theme.color.white, opacity: 0.92, marginTop: 2 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: theme.radius.pill },
  streakText: { color: theme.color.white, fontWeight: '700', fontSize: theme.fontSize.body },
  section: { fontSize: theme.fontSize.subtitle, fontWeight: '700', color: theme.color.textPrimary, marginBottom: theme.spacing.md },
  muted: { color: theme.color.textSecondary, fontSize: theme.fontSize.body },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.color.card,
    borderColor: theme.color.border,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  logMid: { flex: 1 },
  logName: { fontWeight: '700', color: theme.color.textPrimary, fontSize: theme.fontSize.body },
  logMacros: { color: theme.color.textSecondary, fontSize: theme.fontSize.caption, marginTop: 2 },
  logKcal: { fontWeight: '700', color: theme.color.pink, fontSize: theme.fontSize.body },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(35,17,47,0.45)' },
  sheet: { borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl, gap: 2 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  sheetTitle: { fontSize: theme.fontSize.subtitle, fontWeight: '700', color: theme.color.textPrimary },
  macroFields: { flexDirection: 'row', gap: theme.spacing.sm },
  macroInput: { flex: 1 },
});
