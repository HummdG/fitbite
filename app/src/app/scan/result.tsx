import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { Stack, useRouter } from 'expo-router';

import { Button, DishCard, ScreenContainer } from '@/components';
import { lastScan } from '@/features/scan/lastScan';
import { theme } from '@/theme';

export default function Result() {
  const router = useRouter();
  const [result] = useState(() => lastScan.get());

  const header = (
    <Stack.Screen
      options={{
        headerShown: true,
        title: 'Menu results',
        headerStyle: { backgroundColor: theme.color.background },
        headerTintColor: theme.color.purple,
        headerTitleStyle: { fontFamily: theme.fontFamily.semibold, color: theme.color.textPrimary },
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

  const bestName = result.best_match?.name;
  const openDish = (name: string) => router.push({ pathname: '/scan/item', params: { name } });

  return (
    <ScreenContainer>
      {header}

      {result.restaurant_name ? <Text style={styles.restaurant}>{result.restaurant_name}</Text> : null}
      <Text style={styles.sub}>
        {result.dishes.length} dishes ranked for your goals — tap any for the full breakdown.
      </Text>

      {result.best_match && (
        <>
          <Text style={styles.kicker}>Best pick for you</Text>
          <DishCard dish={result.best_match} highlight onPress={() => openDish(result.best_match!.name)} />
        </>
      )}

      <Text style={styles.section}>All dishes</Text>
      <View style={{ gap: theme.spacing.sm }}>
        {result.dishes
          .filter((d) => d.name !== bestName)
          .map((d) => (
            <DishCard key={d.name} dish={d} onPress={() => openDish(d.name)} />
          ))}
      </View>

      <Text style={styles.disclaimer}>Estimates only — actual values vary by kitchen and portion.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  restaurant: { fontSize: theme.fontSize.title, fontWeight: '700', color: theme.color.textPrimary, marginBottom: 2 },
  sub: { fontSize: theme.fontSize.body, color: theme.color.textSecondary, marginBottom: theme.spacing.lg },
  kicker: { fontSize: theme.fontSize.subtitle, fontWeight: '700', color: theme.color.pink, marginBottom: theme.spacing.sm },
  section: { fontSize: theme.fontSize.subtitle, fontWeight: '700', color: theme.color.textPrimary, marginTop: theme.spacing.xl, marginBottom: theme.spacing.md },
  muted: { color: theme.color.textSecondary, fontSize: theme.fontSize.body, marginBottom: theme.spacing.lg },
  disclaimer: { color: theme.color.textSecondary, fontSize: theme.fontSize.caption, marginTop: theme.spacing.xl, textAlign: 'center' },
});
