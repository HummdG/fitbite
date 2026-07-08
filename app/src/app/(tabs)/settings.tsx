import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { useQueryClient } from '@tanstack/react-query';

import { Button, Card, Field, Icon, OptionRow, ScreenContainer, Toggle } from '@/components';
import { confirmSignOut, useSession } from '@/features/auth/useSession';
import { useProfile } from '@/features/profile/useProfile';
import { WIDGET_EMOJI } from '@/lib/emoji';
import { MACRO_ORDER, MACROS } from '@/lib/macros';
import { supabase } from '@/lib/supabase';
import { theme, withAlpha } from '@/theme';
import type { MacroKey } from '@/types/api';

const STRICTNESS_LABEL: Record<string, string> = { relaxed: 'Relaxed', balanced: 'Balanced', strict: 'Strict' };

// Macros the user can toggle onto the Today dashboard (derived from the registry).
const MACRO_WIDGETS = MACRO_ORDER.map((key) => ({ key, label: MACROS[key].label }));

// Not tracked yet — surfaced as "coming soon" rather than dead toggles.
const SOON_WIDGETS: { key: string; label: string }[] = [
  { key: 'water', label: 'Water' },
  { key: 'steps', label: 'Steps' },
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
  // Editable goals mirror the enabled dials, with Calories always present.
  const goalKeys = MACRO_ORDER.filter((k) => k === 'calories' || widgets.includes(k));
  const [editing, setEditing] = useState<MacroKey | null>(null);

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

  const saveGoal = async (key: MacroKey, value: number) => {
    if (!userId) return;
    await supabase
      .from('profiles')
      .update({ [MACROS[key].targetField]: value })
      .eq('id', userId);
    qc.invalidateQueries({ queryKey: ['profile', userId] });
  };

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
      <View style={styles.goalList}>
        {goalKeys.map((key) => {
          const m = MACROS[key];
          return (
            <OptionRow
              key={key}
              icon="chevron"
              emoji={m.emoji}
              tint={m.color}
              title={m.label}
              value={profile ? `${profile[m.targetField].toLocaleString()} ${m.goalUnit}` : '—'}
              onPress={profile ? () => setEditing(key) : undefined}
            />
          );
        })}
      </View>

      <Text style={styles.section}>Preferences</Text>
      <Card style={styles.cardGap}>
        <Row label="Diet" value={profile?.dietary_prefs?.length ? profile.dietary_prefs.map(pretty).join(' · ') : 'None'} />
        <Row label="Strictness" value={profile ? STRICTNESS_LABEL[profile.strictness] ?? profile.strictness : '—'} last />
      </Card>

      <Text style={styles.section}>Dashboard widgets</Text>
      <Text style={styles.sectionSub}>Choose what appears on your Today dashboard.</Text>
      <View style={styles.widgetGrid}>
        {MACRO_WIDGETS.map((w) => (
          <View key={w.key} style={styles.widgetCell}>
            <Text style={styles.widgetLabel}>
              {WIDGET_EMOJI[w.key]} {w.label}
            </Text>
            <Toggle value={widgets.includes(w.key)} onValueChange={() => toggleWidget(w.key)} />
          </View>
        ))}
      </View>

      <View style={styles.soonList}>
        {SOON_WIDGETS.map((w) => (
          <View key={w.key} style={styles.soonRow}>
            <Text style={styles.soonLabel}>
              {WIDGET_EMOJI[w.key]} {w.label}
            </Text>
            <View style={styles.soonPill}>
              <Icon name="lock" size={12} color={theme.color.purple} />
              <Text style={styles.soonPillText}>Coming soon</Text>
            </View>
          </View>
        ))}
      </View>

      <EditGoalSheet
        macroKey={editing}
        current={editing && profile ? profile[MACROS[editing].targetField] : 0}
        onClose={() => setEditing(null)}
        onSave={async (value) => {
          if (editing) await saveGoal(editing, value);
        }}
      />
    </ScreenContainer>
  );
}

/** Bottom-sheet editor for a single goal target. */
function EditGoalSheet({
  macroKey,
  current,
  onClose,
  onSave,
}: {
  macroKey: MacroKey | null;
  current: number;
  onClose: () => void;
  onSave: (value: number) => Promise<void>;
}) {
  const macro = macroKey ? MACROS[macroKey] : null;
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);

  // Seed the input with the current target each time the sheet opens.
  useEffect(() => {
    if (macroKey) setValue(String(current));
  }, [macroKey, current]);

  const save = async () => {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return;
    setBusy(true);
    try {
      await onSave(Math.round(n));
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={!!macro} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Dismiss" />
        <Card style={styles.sheet}>
          <View style={styles.sheetGrabber} />
          <View style={styles.sheetHeader}>
            <View style={styles.sheetTitleWrap}>
              {!!macro && <Text style={styles.sheetEmoji}>{macro.emoji}</Text>}
              <Text style={styles.sheetTitle}>Edit {macro?.label}</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
              <Icon name="close" size={22} color={theme.color.textSecondary} />
            </Pressable>
          </View>
          <Field
            label={macro ? `New value (${macro.goalUnit})` : ''}
            keyboardType="numeric"
            value={value}
            onChangeText={setValue}
            placeholder="0"
            autoFocus
          />
          <Button title="Save" onPress={save} loading={busy} disabled={!value.trim()} />
        </Card>
      </KeyboardAvoidingView>
    </Modal>
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
  goalList: { gap: theme.spacing.sm, marginBottom: theme.spacing.xl },
  divider: { borderBottomWidth: 1, borderBottomColor: theme.color.border },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  rowLabel: { color: theme.color.textSecondary, fontSize: theme.fontSize.body },
  rowValue: { color: theme.color.textPrimary, fontSize: theme.fontSize.body, fontWeight: '600', flexShrink: 1, textAlign: 'right', marginLeft: theme.spacing.md, textTransform: 'capitalize' },
  widgetGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: theme.spacing.lg },
  widgetCell: { width: '47%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  widgetLabel: { fontSize: theme.fontSize.body, color: theme.color.textPrimary, fontWeight: '600' },
  soonList: { marginTop: theme.spacing.lg, gap: theme.spacing.sm },
  soonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: withAlpha(theme.color.purple, 0x0a),
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
  },
  soonLabel: { fontSize: theme.fontSize.body, color: theme.color.textSecondary, fontWeight: '600' },
  soonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: withAlpha(theme.color.purple, 0x14),
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  soonPillText: { fontSize: theme.fontSize.caption, color: theme.color.purple, fontWeight: '700' },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(35,17,47,0.45)' },
  sheet: { borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl, gap: 2 },
  sheetGrabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: theme.color.border, marginBottom: theme.spacing.md },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  sheetTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sheetEmoji: { fontSize: 20 },
  sheetTitle: { fontSize: theme.fontSize.subtitle, fontWeight: '700', color: theme.color.textPrimary },
});
