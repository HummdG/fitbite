import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import { Calendar, Card, ScreenContainer, Thumb } from '@/components';
import { useSession } from '@/features/auth/useSession';
import { useHistory } from '@/features/history/useHistory';
import { useProfile } from '@/features/profile/useProfile';
import { localDateKey } from '@/features/today/useToday';
import { cardShadow, theme } from '@/theme';

export default function History() {
  const { session } = useSession();
  const userId = session?.user?.id;
  const { data: history } = useHistory(userId, 90);
  const { data: profile } = useProfile(userId);
  const [month, setMonth] = useState(() => new Date());
  const [selected, setSelected] = useState(() => localDateKey());

  const target = profile?.calorie_target ?? 0;
  const { marked, overBudget } = useMemo(() => {
    const marked = new Set<string>();
    const overBudget = new Set<string>();
    if (history) {
      for (const [date, bucket] of history.byDate) {
        if (!bucket.rows.length) continue;
        if (target > 0 && bucket.totals.calories > target) overBudget.add(date);
        else marked.add(date);
      }
    }
    return { marked, overBudget };
  }, [history, target]);

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
          overBudget={overBudget}
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
        <View style={{ gap: theme.spacing.sm }}>
          {day.rows.map((r) => (
            <View key={r.id} style={styles.row}>
              <Thumb size={44} name={r.name} />
              <View style={styles.mid}>
                <Text style={styles.name} numberOfLines={1}>
                  {r.name}
                </Text>
                <Text style={styles.macros}>
                  {r.protein_g}g P · {r.carbs_g}g C · {r.fibre_g}g Fb
                </Text>
              </View>
              <Text style={styles.kcal}>{r.calories.toLocaleString()} kcal</Text>
            </View>
          ))}
        </View>
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
  title: { fontSize: theme.fontSize.headline, fontWeight: '800', color: theme.color.textPrimary, marginTop: theme.spacing.md },
  sub: { fontSize: theme.fontSize.body, color: theme.color.textSecondary, marginBottom: theme.spacing.lg },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  section: { fontSize: theme.fontSize.subtitle, fontWeight: '700', color: theme.color.textPrimary },
  dayTotal: { fontSize: theme.fontSize.subtitle, fontWeight: '800', color: theme.color.pink },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.color.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    ...cardShadow(),
  },
  mid: { flex: 1 },
  name: { fontWeight: '700', color: theme.color.textPrimary, fontSize: theme.fontSize.body },
  macros: { color: theme.color.textSecondary, fontSize: theme.fontSize.caption, marginTop: 2 },
  kcal: { fontWeight: '800', color: theme.color.pink, fontSize: theme.fontSize.body },
  muted: { color: theme.color.textSecondary, fontSize: theme.fontSize.body },
});
