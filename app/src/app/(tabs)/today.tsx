import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, Card, GradientHeader, MacroBar, MacroRing, ScreenContainer } from '@/components';
import { useSession } from '@/features/auth/useSession';
import { useProfile } from '@/features/profile/useProfile';
import { useToday } from '@/features/today/useToday';
import { theme } from '@/theme';

export default function Today() {
  const router = useRouter();
  const { session } = useSession();
  const userId = session?.user?.id;
  const { data: profile } = useProfile(userId);
  const { data: today, isLoading } = useToday(userId);

  const totals = today?.totals ?? { calories: 0, protein_g: 0, fibre_g: 0 };
  const calTarget = profile?.calorie_target ?? 0;
  const proTarget = profile?.protein_target_g ?? 0;
  const fibTarget = profile?.fibre_target_g ?? 0;
  const left = calTarget - totals.calories;

  return (
    <ScreenContainer>
      <GradientHeader style={{ marginBottom: theme.spacing.lg }}>
        <Text style={styles.hello}>Today</Text>
        <Text style={styles.helloSub}>
          {left >= 0 ? `${left.toLocaleString()} kcal left to spend` : `${Math.abs(left).toLocaleString()} kcal over`}
        </Text>
      </GradientHeader>

      <Card style={{ alignItems: 'center', marginBottom: theme.spacing.lg }}>
        <MacroRing value={totals.calories} target={calTarget} unit="kcal" />
        <View style={{ height: theme.spacing.lg, width: '100%' }} />
        <MacroBar label="Protein" value={totals.protein_g} target={proTarget} color={theme.color.purple} />
        <MacroBar label="Fibre" value={totals.fibre_g} target={fibTarget} color={theme.color.berry} />
      </Card>

      <Button title="Scan a menu" onPress={() => router.push('/scanner')} />
      <View style={{ height: theme.spacing.sm }} />
      <Button
        title="Add food"
        variant="secondary"
        onPress={() => Alert.alert('Coming soon', 'Manual entry arrives after this first release. For now, scan a menu!')}
      />

      <Text style={styles.section}>Today&apos;s log</Text>
      {isLoading ? (
        <Text style={styles.muted}>Loading…</Text>
      ) : today && today.rows.length > 0 ? (
        today.rows.map((r) => (
          <Card key={r.id} style={{ marginBottom: theme.spacing.sm }}>
            <View style={styles.logRow}>
              <Text style={styles.logName}>{r.name}</Text>
              <Text style={styles.logKcal}>{r.calories} kcal</Text>
            </View>
            <Text style={styles.logMacros}>
              {r.protein_g}g protein · {r.fibre_g}g fibre
            </Text>
          </Card>
        ))
      ) : (
        <Text style={styles.muted}>Nothing logged yet. Scan a menu to get started.</Text>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hello: { fontSize: theme.fontSize.title, fontWeight: '700', color: theme.color.white },
  helloSub: { fontSize: theme.fontSize.subtitle, color: theme.color.white, opacity: 0.92, marginTop: 4 },
  section: { fontSize: theme.fontSize.subtitle, fontWeight: '700', color: theme.color.textPrimary, marginTop: theme.spacing.xl, marginBottom: theme.spacing.md },
  muted: { color: theme.color.textSecondary, fontSize: theme.fontSize.body },
  logRow: { flexDirection: 'row', justifyContent: 'space-between' },
  logName: { flex: 1, fontWeight: '600', color: theme.color.textPrimary, fontSize: theme.fontSize.body },
  logKcal: { fontWeight: '700', color: theme.color.pink, fontSize: theme.fontSize.body },
  logMacros: { color: theme.color.textSecondary, fontSize: theme.fontSize.caption, marginTop: 4 },
});
