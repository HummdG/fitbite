import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { useRouter } from 'expo-router';

import { Button, Logo, ScreenContainer } from '@/components';
import { theme } from '@/theme';

export default function Welcome() {
  const router = useRouter();

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.wrap}>
        <View style={styles.hero}>
          <Logo size={232} />
          <Text style={styles.tagline}>
            Find the <Text style={styles.taglineAccent}>bite</Text> that fits.
          </Text>
          <Text style={styles.sub}>
            Take the guesswork out of eating out — scan a menu and get the picks that fit your goals.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button title="Get started" onPress={() => router.push('/sign-up')} />
          <Button title="I have an account" variant="secondary" onPress={() => router.push('/sign-in')} />
          <Text style={styles.terms}>
            By continuing, you agree to our <Text style={styles.termsLink}>Terms</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'space-between', paddingVertical: theme.spacing.xxl },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md },
  tagline: { fontSize: theme.fontSize.headline, fontWeight: '800', color: theme.color.textPrimary, textAlign: 'center' },
  taglineAccent: { color: theme.color.pink },
  sub: {
    fontSize: theme.fontSize.body,
    color: theme.color.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: theme.spacing.lg,
  },
  actions: { gap: theme.spacing.sm },
  terms: {
    fontSize: theme.fontSize.caption,
    color: theme.color.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    lineHeight: 18,
  },
  termsLink: { color: theme.color.pink, fontWeight: '700' },
});
