import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { Button, DishCard, ScreenContainer } from '@/components';
import { useSession } from '@/features/auth/useSession';
import { lastScan } from '@/features/scan/lastScan';
import { dishToLogInput, useAddToToday } from '@/features/today/useToday';
import { theme } from '@/theme';
import type { ScoredDish } from '@/types/api';

export default function Result() {
  const router = useRouter();
  const { session } = useSession();
  const add = useAddToToday(session?.user?.id);
  const [result] = useState(() => lastScan.get());
  const [addingName, setAddingName] = useState<string | null>(null);

  const header = (
    <Stack.Screen
      options={{
        headerShown: true,
        title: 'Best for you',
        headerStyle: { backgroundColor: theme.color.background },
        headerTintColor: theme.color.purple,
        headerShadowVisible: false,
      }}
    />
  );

  if (!result) {
    return (
      <ScreenContainer>
        {header}
        <Text style={styles.muted}>No scan to show. Go back and scan a menu.</Text>
        <Button title="Back to scanner" onPress={() => router.replace('/scanner')} />
      </ScreenContainer>
    );
  }

  const onAdd = async (dish: ScoredDish) => {
    setAddingName(dish.name);
    try {
      await add.mutateAsync(dishToLogInput(dish, result.scan_id));
      Alert.alert('Added to Today', `${dish.name} is in your log.`, [
        { text: 'View Today', onPress: () => router.replace('/today') },
        { text: 'Keep browsing' },
      ]);
    } catch (e) {
      Alert.alert('Could not add', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setAddingName(null);
    }
  };

  return (
    <ScreenContainer>
      {header}

      {result.best_match ? (
        <>
          <Text style={styles.kicker}>Best pick for you</Text>
          <DishCard
            dish={result.best_match}
            highlight
            onAdd={() => onAdd(result.best_match!)}
            adding={addingName === result.best_match.name}
          />
        </>
      ) : (
        <Text style={styles.muted}>No clear best pick — see the options below.</Text>
      )}

      {result.good_options.length > 0 && (
        <>
          <Text style={styles.section}>Other good options</Text>
          {result.good_options.map((d) => (
            <View key={d.name} style={{ marginBottom: theme.spacing.md }}>
              <DishCard dish={d} onAdd={() => onAdd(d)} adding={addingName === d.name} />
            </View>
          ))}
        </>
      )}

      {result.avoid.length > 0 && (
        <>
          <Text style={styles.section}>Avoid / be careful</Text>
          {result.avoid.map((d) => (
            <View key={d.name} style={{ marginBottom: theme.spacing.md }}>
              <DishCard dish={d} />
            </View>
          ))}
        </>
      )}

      <Text style={styles.disclaimer}>Estimates only — actual values vary by kitchen and portion.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  kicker: { fontSize: theme.fontSize.subtitle, fontWeight: '700', color: theme.color.pink, marginBottom: theme.spacing.sm },
  section: { fontSize: theme.fontSize.subtitle, fontWeight: '700', color: theme.color.textPrimary, marginTop: theme.spacing.xl, marginBottom: theme.spacing.md },
  muted: { color: theme.color.textSecondary, fontSize: theme.fontSize.body, marginBottom: theme.spacing.lg },
  disclaimer: { color: theme.color.textSecondary, fontSize: theme.fontSize.caption, marginTop: theme.spacing.xl, textAlign: 'center' },
});
