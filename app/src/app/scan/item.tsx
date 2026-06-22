import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { Button, Card, DishCard, Icon, MacroStat, Pill, ScreenContainer, Thumb } from '@/components';
import { useSession } from '@/features/auth/useSession';
import { lastScan } from '@/features/scan/lastScan';
import { dishToLogInput, useAddToToday } from '@/features/today/useToday';
import { theme, verdictColor } from '@/theme';

export default function ItemDetails() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
  const { session } = useSession();
  const add = useAddToToday(session?.user?.id);
  const [result] = useState(() => lastScan.get());
  const [adding, setAdding] = useState(false);

  const dish = result?.dishes.find((d) => d.name === name);

  const header = (
    <Stack.Screen
      options={{
        headerShown: true,
        title: 'Item details',
        headerStyle: { backgroundColor: theme.color.background },
        headerTintColor: theme.color.purple,
        headerShadowVisible: false,
      }}
    />
  );

  if (!dish) {
    return (
      <ScreenContainer>
        {header}
        <Text style={styles.muted}>That dish isn&apos;t available anymore.</Text>
        <Button title="Back to results" onPress={() => router.back()} />
      </ScreenContainer>
    );
  }

  const score = Math.round(dish.fit_score * 100);
  const alternatives = (result?.good_options ?? []).filter((d) => d.name !== dish.name).slice(0, 3);

  const onAdd = async () => {
    setAdding(true);
    try {
      await add.mutateAsync(dishToLogInput(dish, result?.scan_id));
      Alert.alert('Added to Today', `${dish.name} is in your log.`, [
        { text: 'View Today', onPress: () => router.replace('/today') },
        { text: 'Keep browsing' },
      ]);
    } catch (e) {
      Alert.alert('Could not add', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <ScreenContainer>
      {header}

      <Thumb size={160} radius={theme.radius.xl} style={styles.hero} />

      <View style={styles.titleRow}>
        <Text style={styles.name}>{dish.name}</Text>
        <View style={styles.scoreBadge}>
          <Text style={[styles.scoreNum, { color: verdictColor(dish.verdict) }]}>{score}</Text>
          <Text style={styles.scoreCaption}>fit</Text>
        </View>
      </View>
      <View style={styles.pillRow}>
        <Pill verdict={dish.verdict} />
      </View>

      <View style={styles.grid}>
        <MacroStat icon="calories" label="Calories" value={dish.calories.point} unit="kcal" color={theme.color.macro.calories} />
        <MacroStat icon="protein" label="Protein" value={dish.protein_g.point} unit="g" color={theme.color.macro.protein} />
        <MacroStat icon="carbs" label="Carbs" value={dish.carbs_g.point} unit="g" color={theme.color.macro.carbs} />
        <MacroStat icon="fat" label="Fat" value={dish.fat_g.point} unit="g" color={theme.color.macro.fat} />
      </View>

      <Text style={styles.section}>About this item</Text>
      <Card style={{ marginBottom: theme.spacing.lg, gap: 8 }}>
        {!!dish.description && <Text style={styles.body}>{dish.description}</Text>}
        {!!dish.why && <Text style={styles.body}>{dish.why}</Text>}
        {dish.ingredients.length > 0 && (
          <Text style={styles.ingredients}>Ingredients: {dish.ingredients.join(', ')}</Text>
        )}
      </Card>

      {dish.modifications.length > 0 && (
        <>
          <Text style={styles.section}>Better swaps</Text>
          <Card style={{ marginBottom: theme.spacing.lg, gap: 8 }}>
            {dish.modifications.map((m, i) => (
              <View key={i} style={styles.swapRow}>
                <Icon name="swap" size={16} color={theme.color.purple} />
                <Text style={styles.body}>{m}</Text>
              </View>
            ))}
          </Card>
        </>
      )}

      {alternatives.length > 0 && (
        <>
          <Text style={styles.section}>Other good options</Text>
          <View style={{ gap: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
            {alternatives.map((d) => (
              <DishCard key={d.name} dish={d} onPress={() => router.setParams({ name: d.name })} />
            ))}
          </View>
        </>
      )}

      <Button title={adding ? 'Adding…' : 'Add to today'} onPress={onAdd} loading={adding} />
      <Text style={styles.disclaimer}>Estimates only — actual values vary by kitchen and portion.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: { alignSelf: 'center', marginBottom: theme.spacing.lg },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: theme.spacing.md },
  name: { flex: 1, fontSize: theme.fontSize.headline, fontWeight: '700', color: theme.color.textPrimary },
  scoreBadge: { alignItems: 'center' },
  scoreNum: { fontSize: theme.fontSize.headline, fontWeight: '800' },
  scoreCaption: { fontSize: 10, color: theme.color.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: -4 },
  pillRow: { flexDirection: 'row', marginTop: theme.spacing.sm, marginBottom: theme.spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md, marginBottom: theme.spacing.sm },
  section: { fontSize: theme.fontSize.subtitle, fontWeight: '700', color: theme.color.textPrimary, marginTop: theme.spacing.md, marginBottom: theme.spacing.md },
  body: { color: theme.color.textPrimary, fontSize: theme.fontSize.body, lineHeight: 21, flex: 1 },
  ingredients: { color: theme.color.textSecondary, fontSize: theme.fontSize.caption, lineHeight: 18 },
  swapRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  muted: { color: theme.color.textSecondary, fontSize: theme.fontSize.body, marginBottom: theme.spacing.lg },
  disclaimer: { color: theme.color.textSecondary, fontSize: theme.fontSize.caption, marginTop: theme.spacing.xl, textAlign: 'center' },
});
