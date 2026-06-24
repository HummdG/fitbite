import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { Button, Card, DishCard, Icon, MacroStat, ScreenContainer, Tag, Thumb } from '@/components';
import type { TagTone } from '@/components';
import { useSession } from '@/features/auth/useSession';
import { lastScan } from '@/features/scan/lastScan';
import { dishToLogInput, useAddToToday } from '@/features/today/useToday';
import { theme, verdictLabel } from '@/theme';
import type { Verdict } from '@/types/api';

const TONE: Record<Verdict, TagTone> = {
  great: 'good',
  good_with_mods: 'info',
  calorie_dense: 'warn',
  hard_to_track: 'neutral',
  not_ideal: 'bad',
};

export default function ItemDetails() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
  const { session } = useSession();
  const add = useAddToToday(session?.user?.id);
  const [result] = useState(() => lastScan.get());
  const [adding, setAdding] = useState(false);
  const [fav, setFav] = useState(false);

  const dish = result?.dishes.find((d) => d.name === name);
  const isBest = !!dish && result?.best_match?.name === dish.name;

  const header = (
    <Stack.Screen
      options={{
        headerShown: true,
        title: '',
        headerStyle: { backgroundColor: theme.color.background },
        headerTintColor: theme.color.textPrimary,
        headerShadowVisible: false,
        headerRight: () => (
          <Pressable onPress={() => setFav((f) => !f)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Favourite">
            <Icon name={fav ? 'heart' : 'heartOutline'} size={24} color={theme.color.pink} />
          </Pressable>
        ),
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

      <Thumb size={160} name={dish.name} style={styles.hero} />

      <Text style={styles.name}>{dish.name}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.restaurant} numberOfLines={1}>
          {result?.restaurant_name ?? 'Estimated values'}
        </Text>
        <Tag
          label={isBest ? 'Best match' : verdictLabel(dish.verdict)}
          tone={isBest ? 'good' : TONE[dish.verdict] ?? 'neutral'}
        />
      </View>

      <Text style={styles.kcal}>
        {dish.calories.point.toLocaleString()}
        <Text style={styles.kcalUnit}> kcal</Text>
      </Text>

      <View style={styles.grid}>
        <MacroStat label="Protein" value={dish.protein_g.point} unit="g" color={theme.color.macro.protein} />
        <MacroStat label="Carbs" value={dish.carbs_g.point} unit="g" color={theme.color.macro.carbs} />
        <MacroStat label="Fibre" value={dish.fibre_g.point} unit="g" color={theme.color.macro.fibre} />
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
          <Card style={{ marginBottom: theme.spacing.lg, gap: 10 }}>
            {dish.modifications.map((m, i) => (
              <View key={i} style={styles.swapRow}>
                <Icon name="swap" size={16} color={theme.color.macro.fibre} />
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
  hero: { width: '100%', height: 190, borderRadius: theme.radius.xl, marginBottom: theme.spacing.lg },
  name: { fontSize: theme.fontSize.headline, fontWeight: '800', color: theme.color.textPrimary },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md, marginTop: 4 },
  restaurant: { flex: 1, fontSize: theme.fontSize.body, color: theme.color.textSecondary },
  kcal: { fontSize: theme.fontSize.display, fontWeight: '800', color: theme.color.textPrimary, marginTop: theme.spacing.sm },
  kcalUnit: { fontSize: theme.fontSize.subtitle, fontWeight: '700', color: theme.color.textSecondary },
  grid: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm },
  section: { fontSize: theme.fontSize.subtitle, fontWeight: '700', color: theme.color.textPrimary, marginTop: theme.spacing.md, marginBottom: theme.spacing.md },
  body: { color: theme.color.textPrimary, fontSize: theme.fontSize.body, lineHeight: 21, flex: 1 },
  ingredients: { color: theme.color.textSecondary, fontSize: theme.fontSize.caption, lineHeight: 18 },
  swapRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  muted: { color: theme.color.textSecondary, fontSize: theme.fontSize.body, marginBottom: theme.spacing.lg },
  disclaimer: { color: theme.color.textSecondary, fontSize: theme.fontSize.caption, marginTop: theme.spacing.xl, textAlign: 'center' },
});
