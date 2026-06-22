import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { Link } from 'expo-router';

import { Button, Field, Logo, ScreenContainer } from '@/components';
import { supabase } from '@/lib/supabase';
import { theme } from '@/theme';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onSignUp = async () => {
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      Alert.alert('Sign up failed', error.message);
    } else if (!data.session) {
      // Email confirmation is ON — no session yet.
      Alert.alert('Almost there', 'Check your email to confirm your account, then sign in.');
    }
    // If a session is returned (confirmation off), the gate routes to onboarding.
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Logo size={60} withWordmark style={{ marginBottom: theme.spacing.md }} />
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.sub}>Set your goals once — then just scan and go.</Text>
      </View>

      <Field
        label="Email"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
      />
      <Field
        label="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="At least 6 characters"
      />
      <Button title="Create account" onPress={onSignUp} loading={busy} disabled={!email || password.length < 6} style={{ marginTop: theme.spacing.sm }} />

      <Link href="/sign-in" style={styles.link}>
        Already have an account? Sign in
      </Link>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginTop: theme.spacing.lg, marginBottom: theme.spacing.xl },
  title: { fontSize: theme.fontSize.headline, fontWeight: '700', color: theme.color.textPrimary },
  sub: { fontSize: theme.fontSize.body, color: theme.color.textSecondary, marginTop: 4, textAlign: 'center' },
  link: { marginTop: theme.spacing.xl, textAlign: 'center', color: theme.color.purple, fontFamily: theme.fontFamily.semibold },
});
