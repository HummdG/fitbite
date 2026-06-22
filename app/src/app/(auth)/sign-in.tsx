import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
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
      <View style={styles.header}>
        <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.sub}>Sign in to pick up where you left off.</Text>
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
        placeholder="••••••••"
      />
      <Button title="Sign in" onPress={onSignIn} loading={busy} disabled={!email || !password} style={{ marginTop: theme.spacing.sm }} />

      <Link href="/sign-up" style={styles.link}>
        New here? Create an account
      </Link>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginTop: theme.spacing.lg, marginBottom: theme.spacing.xl },
  logo: { width: 96, height: 96, marginBottom: theme.spacing.sm },
  title: { fontSize: theme.fontSize.headline, fontWeight: '700', color: theme.color.textPrimary },
  sub: { fontSize: theme.fontSize.body, color: theme.color.textSecondary, marginTop: 4, textAlign: 'center' },
  link: { marginTop: theme.spacing.xl, textAlign: 'center', color: theme.color.purple, fontWeight: '600' },
});
