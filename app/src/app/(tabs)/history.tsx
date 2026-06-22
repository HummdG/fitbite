import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import { Calendar, Card, ScreenContainer, Thumb } from '@/components';
import { useSession } from '@/features/auth/useSession';
import { useHistory } from '@/features/history/useHistory';
import { localDateKey } from '@/features/today/useToday';
import { softShadow, theme } from '@/theme';

export default function History() {
  const { session } = useSession();
  const { data: history } = useHistory(session?.user?.id, 90);
  const [month, setMonth] = useState(() => new Date());
  const [selected, setSelected] = useState(() => localDateKey());

  const marked = useMemo(() => new Set(history ? Array.from(history.byDate.keys()) : []), [history]);
  const day = history?.byDate.get(selected);

  const shiftMonth = (delta: number) => {
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Log</Text>
      <Text style={styles.sub}>Browse what you ate on any day.</Text>

      <Card style={{ marginBottom: theme.spacing.lg }}>
        <Calendar
          month={month}
          selected={selected}
          marked={marked}
          onSelect={setSelected}
          onPrev={() => shiftMonth(-1)}
          onNext={() => shiftMonth(1)}
        />
      </Card>

      <View style={styles.dayHeader}>
        <Text style={styles.section}>{prettyDate(selected)}</Text>
        <Text style={styles.dayTotal}>{(day?.totals.calories ?? 0).toLocaleString()} kcal</Text>
      </View>

      {day && day.rows.length > 0 ? (
        day.rows.map((r) => (
          <View key={r.id} style={styles.row}>
            <Thumb size={44} name={r.name} />
            <View style={styles.mid}>
              <Text style={styles.name} numberOfLines={1}>
                {r.name}
              </Text>
              <Text style={styles.macros}>
                {r.protein_g}g P · {r.carbs_g}g C · {r.fat_g}g F
              </Text>
            </View>
            <Text style={styles.kcal}>{r.calories} kcal</Text>
          </View>
        ))
      ) : (
        <Text style={styles.muted}>Nothing logged on this day.</Text>
      )}
    </ScreenContainer>
  );
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function prettyDate(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

const styles = StyleSheet.create({
  title: { fontSize: theme.fontSize.title, fontWeight: '700', color: theme.color.textPrimary, marginTop: theme.spacing.md },
  sub: { fontSize: theme.fontSize.body, color: theme.color.textSecondary, marginBottom: theme.spacing.lg },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  section: { fontSize: theme.fontSize.subtitle, fontWeight: '700', color: theme.color.textPrimary },
  dayTotal: { fontSize: theme.fontSize.body, fontWeight: '700', color: theme.color.pink },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.color.card,
    borderColor: theme.color.border,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...softShadow(),
  },
  mid: { flex: 1 },
  name: { fontWeight: '700', color: theme.color.textPrimary, fontSize: theme.fontSize.body },
  macros: { color: theme.color.textSecondary, fontSize: theme.fontSize.caption, marginTop: 2 },
  kcal: { fontWeight: '700', color: theme.color.pink, fontSize: theme.fontSize.body },
  muted: { color: theme.color.textSecondary, fontSize: theme.fontSize.body },
});
