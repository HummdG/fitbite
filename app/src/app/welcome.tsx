import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, ScreenContainer } from '@/components';
import { theme } from '@/theme';

export default function Welcome() {
  const router = useRouter();

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.wrap}>
        <View style={styles.hero}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.tagline}>
            Find the <Text style={styles.taglineAccent}>bite</Text> that fits.
          </Text>
          <Text style={styles.sub}>Take the guesswork out of eating out — scan a menu and get the picks that fit your goals.</Text>
        </View>

        <View style={styles.actions}>
          <Button title="Get started" onPress={() => router.push('/sign-up')} />
          <Button title="I already have an account" variant="secondary" onPress={() => router.push('/sign-in')} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'space-between', paddingVertical: theme.spacing.xxl },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md },
  logo: { width: 240, height: 240 },
  tagline: { fontSize: theme.fontSize.title, fontWeight: '700', color: theme.color.textPrimary, textAlign: 'center' },
  taglineAccent: { color: theme.color.pink },
  sub: {
    fontSize: theme.fontSize.body,
    color: theme.color.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: theme.spacing.lg,
  },
  actions: { gap: theme.spacing.sm },
});
