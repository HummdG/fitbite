import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';

import { SessionProvider, useSession } from '@/features/auth/useSession';
import { useProfile } from '@/features/profile/useProfile';
import { queryClient } from '@/lib/queryClient';
import { theme } from '@/theme';

function FullScreenLoader() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.color.background }}>
      <ActivityIndicator size="large" color={theme.color.pink} />
    </View>
  );
}

/** Redirects between auth / onboarding / tabs based on session + profile state. */
function AuthGate() {
  const { session, loading } = useSession();
  const userId = session?.user?.id;
  const { data: profile, isLoading: profileLoading } = useProfile(userId);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const group = segments[0]; // '(auth)' | '(onboarding)' | '(tabs)' | 'scan' | undefined

    if (!session) {
      if (group !== '(auth)') router.replace('/sign-in');
      return;
    }
    if (profileLoading) return;

    if (!profile) {
      if (group !== '(onboarding)') router.replace('/profile');
    } else if (group === '(auth)' || group === '(onboarding)' || group === undefined) {
      router.replace('/today');
    }
  }, [session, loading, profile, profileLoading, segments, router]);

  if (loading) return <FullScreenLoader />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.color.background },
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <StatusBar style="dark" />
          <AuthGate />
        </SessionProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
