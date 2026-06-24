import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

import { SessionProvider, useSession } from '@/features/auth/useSession';
import { useProfile } from '@/features/profile/useProfile';
import { queryClient } from '@/lib/queryClient';
import { theme } from '@/theme';

// Keep the branded splash up until the Plus Jakarta Sans families are ready, so
// the very first frame the user sees is already in-brand (never the system font).
SplashScreen.preventAutoHideAsync().catch(() => {});

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
    const group = segments[0]; // '(auth)' | '(onboarding)' | '(tabs)' | 'scan' | 'welcome' | undefined

    if (!session) {
      // Welcome is the unauthenticated landing; sign-in/up live under (auth).
      if (group !== '(auth)' && group !== 'welcome') router.replace('/welcome');
      return;
    }
    if (profileLoading) return;

    if (!profile) {
      if (group !== '(onboarding)') router.replace('/profile');
    } else if (group === '(auth)' || group === '(onboarding)' || group === 'welcome' || group === undefined) {
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
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const ready = fontsLoaded || !!fontError;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  // Render nothing while fonts load — the native splash stays visible. If the
  // fonts fail outright we still proceed (system font) rather than hang forever.
  if (!ready) return null;

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
