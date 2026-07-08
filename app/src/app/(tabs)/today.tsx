import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { useRouter } from 'expo-router';

import {
  Button,
  Card,
  Field,
  Icon,
  IconName,
  MacroSummary,
  ScreenContainer,
  StreakBadge,
  Thumb,
} from '@/components';
import type { MacroTargets } from '@/components';
import { useSession } from '@/features/auth/useSession';
import { useHistory } from '@/features/history/useHistory';
import { useProfile } from '@/features/profile/useProfile';
import { AddToTodayInput, useAddToToday, useRemoveFromToday, useToday } from '@/features/today/useToday';
import { MACROS, orderMacros } from '@/lib/macros';
import { cardShadow, theme, withAlpha } from '@/theme';
import type { FoodLogRow, MacroKey } from '@/types/api';

/** Consecutive days ending today that have at least one logged item. */
function computeStreak(byDate: Map<string, { rows: FoodLogRow[] }>): number {
  let streak = 0;
  const d = new Date();
  for (;;) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (byDate.get(key)?.rows.length) {
      streak += 1;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}

function prettyTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ap = h < 12 ? 'AM' : 'PM';
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}

const DEFAULT_WIDGETS: MacroKey[] = ['calories', 'protein', 'fibre'];

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
  const left = Math.max(0, (targets.calorie_target || 0) - totals.calories);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.hello}>Today</Text>
          <Text style={styles.kcalLeft}>
            {left.toLocaleString()} kcal left to go
          </Text>
        </View>
        <StreakBadge days={streak} />
      </View>

      <MacroSummary totals={totals} targets={targets} widgets={widgets} style={styles.gauges} />

      <Card style={styles.quickCard}>
        <Text style={styles.quickHeading}>Quick actions</Text>
        <View style={styles.quickRow}>
          <QuickAction icon="scan" label="Scan a menu" tint={theme.color.pink} onPress={() => router.push('/scanner')} />
          <QuickAction icon="plus" label="Add food" tint={theme.color.indigo} onPress={() => setAdding(true)} />
        </View>
      </Card>

      <Text style={styles.section}>Today&apos;s log</Text>
      {isLoading ? (
        <Text style={styles.muted}>Loading…</Text>
      ) : today && today.rows.length > 0 ? (
        <View style={{ gap: theme.spacing.sm }}>
          {today.rows.map((r) => (
            <View key={r.id} style={styles.logRow}>
              <Thumb size={48} name={r.name} />
              <View style={styles.logMid}>
                <Text style={styles.logName} numberOfLines={1}>
                  {r.name}
                </Text>
                <Text style={styles.logSub}>{prettyTime(r.logged_at)}</Text>
              </View>
              <Text style={styles.logKcal}>{r.calories.toLocaleString()} kcal</Text>
              <Pressable onPress={() => remove.mutate(r.id)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Remove ${r.name}`}>
                <Icon name="trash" size={18} color={theme.color.textSecondary} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.muted}>Nothing logged yet. Scan a menu to get started.</Text>
      )}

      <AddFoodModal
        visible={adding}
        widgets={widgets}
        onClose={() => setAdding(false)}
        onSave={async (input) => {
          await add.mutateAsync(input);
          setAdding(false);
        }}
      />
    </ScreenContainer>
  );
}

function QuickAction({ icon, label, tint, onPress }: { icon: IconName; label: string; tint: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.quick, { backgroundColor: withAlpha(tint, 0x12), opacity: pressed ? 0.9 : 1 }]}
    >
      <View style={[styles.quickIcon, { backgroundColor: withAlpha(tint, 0x1f) }]}>
        <Icon name={icon} size={20} color={tint} weight="duotone" />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

function AddFoodModal({
  visible,
  widgets,
  onClose,
  onSave,
}: {
  visible: boolean;
  widgets: MacroKey[];
  onClose: () => void;
  onSave: (input: AddToTodayInput) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [macros, setMacros] = useState<Partial<Record<MacroKey, string>>>({});
  const [busy, setBusy] = useState(false);

  // One box per selected dial, excluding Calories (which has its own field).
  const macroKeys = orderMacros(widgets).filter((k) => k !== 'calories');
  const setMacro = (key: MacroKey, v: string) => setMacros((m) => ({ ...m, [key]: v }));

  const reset = () => {
    setName('');
    setCalories('');
    setMacros({});
  };

  const save = async () => {
    if (!name.trim() || !calories) return;
    setBusy(true);
    try {
      const input: AddToTodayInput = {
        name: name.trim(),
        calories: Number(calories) || 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
        fibre_g: 0,
      };
      for (const key of macroKeys) {
        input[MACROS[key].totalField] = Number(macros[key]) || 0;
      }
      await onSave(input);
      reset();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Dismiss" />
        <Card style={styles.sheet}>
          <View style={styles.sheetGrabber} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Add food</Text>
            <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
              <Icon name="close" size={22} color={theme.color.textSecondary} />
            </Pressable>
          </View>
          <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Chicken wrap" />
          <Field label="Calories (kcal)" keyboardType="numeric" value={calories} onChangeText={setCalories} placeholder="e.g. 480" />
          {macroKeys.length > 0 && (
            <View style={styles.macroFields}>
              {macroKeys.map((key) => (
                <View key={key} style={styles.macroInput}>
                  <Field
                    label={`${MACROS[key].label} (g)`}
                    keyboardType="numeric"
                    value={macros[key] ?? ''}
                    onChangeText={(v) => setMacro(key, v)}
                    placeholder="0"
                  />
                </View>
              ))}
            </View>
          )}
          <Button title="Add to Today" onPress={save} loading={busy} disabled={!name.trim() || !calories} />
        </Card>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: theme.spacing.lg },
  hello: { fontSize: theme.fontSize.headline, fontWeight: '800', color: theme.color.textPrimary },
  kcalLeft: { fontSize: theme.fontSize.body, color: theme.color.pink, fontWeight: '700', marginTop: 2 },
  gauges: { marginBottom: theme.spacing.xl },
  section: { fontSize: theme.fontSize.subtitle, fontWeight: '700', color: theme.color.textPrimary, marginBottom: theme.spacing.md },
  quickCard: { marginBottom: theme.spacing.xl, gap: theme.spacing.md },
  quickHeading: { fontSize: theme.fontSize.subtitle, fontWeight: '700', color: theme.color.textPrimary },
  quickRow: { flexDirection: 'row', gap: theme.spacing.md },
  quick: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
  quickIcon: { width: 38, height: 38, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { flex: 1, fontSize: theme.fontSize.body, fontWeight: '700', color: theme.color.textPrimary },
  muted: { color: theme.color.textSecondary, fontSize: theme.fontSize.body },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.color.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    ...cardShadow(),
  },
  logMid: { flex: 1 },
  logName: { fontWeight: '700', color: theme.color.textPrimary, fontSize: theme.fontSize.body },
  logSub: { color: theme.color.textSecondary, fontSize: theme.fontSize.caption, marginTop: 2 },
  logKcal: { fontWeight: '800', color: theme.color.pink, fontSize: theme.fontSize.body },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(35,17,47,0.45)' },
  sheet: { borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl, gap: 2 },
  sheetGrabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: theme.color.border, marginBottom: theme.spacing.md },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  sheetTitle: { fontSize: theme.fontSize.subtitle, fontWeight: '700', color: theme.color.textPrimary },
  macroFields: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  macroInput: { flexGrow: 1, flexBasis: '30%', minWidth: 92 },
});
