import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { useRouter } from 'expo-router';

import { BarChart, Button, Card, LineChart, ScreenContainer, SegmentedControl } from '@/components';
import { useSession } from '@/features/auth/useSession';
import { denseSeries, useHistory } from '@/features/history/useHistory';
import { useProfile } from '@/features/profile/useProfile';
import { theme } from '@/theme';
import type { DayBucket } from '@/features/history/useHistory';

type Range = '7' | '30' | '90';
const RANGES: { label: string; value: Range }[] = [
  { label: '7 days', value: '7' },
  { label: '30 days', value: '30' },
  { label: '90 days', value: '90' },
];

type Metric = 'calories' | 'protein' | 'fibre';
const METRICS: { label: string; value: Metric }[] = [
  { label: 'Calories', value: 'calories' },
  { label: 'Protein', value: 'protein' },
  { label: 'Fibre', value: 'fibre' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = (key: string) => {
  const [, m, d] = key.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]}`;
};

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

export default function Progress() {
  const router = useRouter();
  const { session } = useSession();
  const { data: history } = useHistory(session?.user?.id, 90);
  const { data: profile } = useProfile(session?.user?.id);
  const [range, setRange] = useState<Range>('7');
  const [metric, setMetric] = useState<Metric>('calories');

  const days = Number(range);
  const series: DayBucket[] = history ? denseSeries(history.byDate, days) : [];
  const logged = series.filter((b) => b.rows.length > 0);

  const pick = (b: DayBucket, m: Metric) =>
    m === 'calories' ? b.totals.calories : m === 'protein' ? b.totals.protein_g : b.totals.fibre_g;

  const goals: Record<Metric, number> = {
    calories: profile?.calorie_target ?? 0,
    protein: profile?.protein_target_g ?? 0,
    fibre: profile?.fibre_target_g ?? 0,
  };
  const colors: Record<Metric, string> = {
    calories: theme.color.macro.calories,
    protein: theme.color.macro.protein,
    fibre: theme.color.macro.fibre,
  };
  const units: Record<Metric, string> = { calories: 'kcal', protein: 'g', fibre: 'g' };

  // Line: connect only logged days so unlogged days don't crash the trend to 0.
  const lineData = logged.map((b) => pick(b, metric));
  const lineLabels: string[] = logged.length
    ? [fmtDate(logged[0].date), fmtDate(logged[logged.length - 1].date)]
    : [];
  // Bars: every day in range (zero-fill is fine for bars).
  const barData = series.map((b) => pick(b, metric));

  const avgs: Record<Metric, number> = {
    calories: avg(logged.map((b) => b.totals.calories)),
    protein: avg(logged.map((b) => b.totals.protein_g)),
    fibre: avg(logged.map((b) => b.totals.fibre_g)),
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Progress</Text>
      <Text style={styles.sub}>Track trends over time and stay on course.</Text>

      <SegmentedControl options={RANGES} value={range} onChange={setRange} />

      <View style={styles.statRow}>
        <Stat label="Avg calories" value={avgs.calories} goal={goals.calories} unit="kcal" color={colors.calories} />
        <Stat label="Avg protein" value={avgs.protein} goal={goals.protein} unit="g" color={colors.protein} />
        <Stat label="Avg fibre" value={avgs.fibre} goal={goals.fibre} unit="g" color={colors.fibre} />
      </View>

      <View style={styles.tabs}>
        <SegmentedControl options={METRICS} value={metric} onChange={setMetric} />
      </View>

      <Card style={styles.chartCard}>
        <Text style={styles.cardCaption}>
          {logged.length} of {days} days logged
        </Text>
        <View style={{ marginTop: theme.spacing.md }}>
          {lineData.length > 0 ? (
            <LineChart
              data={lineData}
              labels={lineLabels}
              color={colors[metric]}
              goal={goals[metric] || undefined}
              goalLabel={goals[metric] ? `Goal ${goals[metric].toLocaleString()} ${units[metric]}` : undefined}
              showAxis
            />
          ) : (
            <Text style={styles.empty}>Log a few days to see your trend.</Text>
          )}
        </View>
      </Card>

      <Card style={styles.chartCard}>
        <Text style={styles.cardLabel}>Daily {metric}</Text>
        <Text style={styles.cardCaption}>
          Daily avg {avgs[metric].toLocaleString()} {units[metric]}
        </Text>
        <View style={{ marginTop: theme.spacing.md }}>
          <BarChart data={barData} color={colors[metric]} />
        </View>
      </Card>

      <Button title="View history" onPress={() => router.push('/history')} style={{ marginTop: theme.spacing.lg }} />
    </ScreenContainer>
  );
}

function Stat({ label, value, goal, unit, color }: { label: string; value: number; goal: number; unit: string; color: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value.toLocaleString()}</Text>
      {goal > 0 && (
        <Text style={styles.statGoal}>
          Goal {goal.toLocaleString()} {unit}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: theme.fontSize.headline, fontWeight: '800', color: theme.color.textPrimary, marginTop: theme.spacing.md },
  sub: { fontSize: theme.fontSize.body, color: theme.color.textSecondary, marginBottom: theme.spacing.lg },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.xl, gap: theme.spacing.sm },
  stat: { flex: 1 },
  statLabel: { fontSize: theme.fontSize.caption, color: theme.color.textSecondary, fontWeight: '600' },
  statValue: { fontSize: theme.fontSize.title, fontWeight: '800', marginTop: 2 },
  statGoal: { fontSize: theme.fontSize.caption, color: theme.color.textSecondary, marginTop: 1 },
  tabs: { marginTop: theme.spacing.xl },
  chartCard: { marginTop: theme.spacing.md },
  cardLabel: { fontSize: theme.fontSize.body, fontWeight: '700', color: theme.color.textPrimary },
  cardCaption: { fontSize: theme.fontSize.caption, color: theme.color.textSecondary, marginTop: 2 },
  empty: { fontSize: theme.fontSize.body, color: theme.color.textSecondary, textAlign: 'center', paddingVertical: theme.spacing.xl },
});
