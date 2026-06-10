import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { Link } from 'expo-router';

import { Button, Field, ScreenContainer } from '@/components';
import { supabase } from '@/lib/supabase';
import { theme } from '@/theme';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onSignIn = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) Alert.alert('Sign in failed', error.message);
    // On success the auth listener updates the session and the gate redirects.
  };

  return (
    <ScreenContainer>
      <Text style={styles.brand}>FitBite</Text>
      <Text style={styles.tagline}>Eat out without ruining your progress.</Text>

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
        placeholder="••••••••"
      />
      <Button title="Sign in" onPress={onSignIn} loading={busy} disabled={!email || !password} />

      <Link href="/sign-up" style={styles.link}>
        New here? Create an account
      </Link>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  brand: { fontSize: theme.fontSize.hero, fontWeight: '700', color: theme.color.pink, marginTop: theme.spacing.xxl },
  tagline: { fontSize: theme.fontSize.subtitle, color: theme.color.textSecondary, marginBottom: theme.spacing.xxl },
  link: { marginTop: theme.spacing.xl, textAlign: 'center', color: theme.color.purple, fontWeight: '600' },
});
