import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, LineChart, MacroStat, ScreenContainer, SegmentedControl } from '@/components';
import { useSession } from '@/features/auth/useSession';
import { denseSeries, useHistory } from '@/features/history/useHistory';
import { theme } from '@/theme';

type Range = '7' | '30' | '90';
const RANGES: { label: string; value: Range }[] = [
  { label: '7 days', value: '7' },
  { label: '30 days', value: '30' },
  { label: '90 days', value: '90' },
];

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

export default function Progress() {
  const { session } = useSession();
  const { data: history } = useHistory(session?.user?.id, 90);
  const [range, setRange] = useState<Range>('30');

  const days = Number(range);
  const series = history ? denseSeries(history.byDate, days) : [];
  const logged = series.filter((b) => b.rows.length > 0);

  const calories = series.map((b) => b.totals.calories);
  const avgCalories = avg(logged.map((b) => b.totals.calories));
  const avgProtein = avg(logged.map((b) => b.totals.protein_g));
  const avgCarbs = avg(logged.map((b) => b.totals.carbs_g));
  const avgFat = avg(logged.map((b) => b.totals.fat_g));

  return (
    <ScreenContainer>
      <Text style={styles.title}>Progress</Text>
      <Text style={styles.sub}>Track trends over time and stay on course.</Text>

      <SegmentedControl options={RANGES} value={range} onChange={setRange} />

      <Card style={styles.headline}>
        <Text style={styles.headlineLabel}>Average daily calories</Text>
        <Text style={styles.headlineValue}>
          {avgCalories.toLocaleString()} <Text style={styles.headlineUnit}>kcal</Text>
        </Text>
        <Text style={styles.headlineSub}>
          {logged.length} of {days} days logged
        </Text>
        <View style={{ marginTop: theme.spacing.md }}>
          <LineChart data={calories} color={theme.color.pink} />
        </View>
      </Card>

      <Text style={styles.section}>Daily averages</Text>
      <View style={styles.grid}>
        <MacroStat icon="protein" label="Protein" value={avgProtein} unit="g" color={theme.color.macro.protein} />
        <MacroStat icon="carbs" label="Carbs" value={avgCarbs} unit="g" color={theme.color.macro.carbs} />
        <MacroStat icon="fat" label="Fat" value={avgFat} unit="g" color={theme.color.macro.fat} />
        <MacroStat icon="calories" label="Calories" value={avgCalories} unit="kcal" color={theme.color.macro.calories} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: theme.fontSize.title, fontWeight: '700', color: theme.color.textPrimary, marginTop: theme.spacing.md },
  sub: { fontSize: theme.fontSize.body, color: theme.color.textSecondary, marginBottom: theme.spacing.lg },
  headline: { marginTop: theme.spacing.lg, marginBottom: theme.spacing.lg },
  headlineLabel: { fontSize: theme.fontSize.body, color: theme.color.textSecondary, fontWeight: '600' },
  headlineValue: { fontSize: theme.fontSize.headline, fontWeight: '800', color: theme.color.textPrimary, marginTop: 2 },
  headlineUnit: { fontSize: theme.fontSize.subtitle, fontWeight: '600', color: theme.color.textSecondary },
  headlineSub: { fontSize: theme.fontSize.caption, color: theme.color.textSecondary, marginTop: 2 },
  section: { fontSize: theme.fontSize.subtitle, fontWeight: '700', color: theme.color.textPrimary, marginBottom: theme.spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
});
