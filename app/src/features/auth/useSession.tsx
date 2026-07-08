import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

type SessionState = {
  session: Session | null;
  loading: boolean;
};

const SessionContext = createContext<SessionState>({ session: null, loading: true });

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return <SessionContext.Provider value={{ session, loading }}>{children}</SessionContext.Provider>;
}

export const useSession = () => useContext(SessionContext);

export async function signOut() {
  await supabase.auth.signOut();
}

/**
 * Confirm, then sign out. Clearing the Supabase session flips the AuthGate to the
 * Welcome screen (and wipes the persisted session so the next launch starts there
 * too) — the one escape hatch out of a half-finished onboarding.
 */
export function confirmSignOut() {
  Alert.alert('Log out', 'Log out and return to the welcome screen?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Log out', style: 'destructive', onPress: () => void signOut() },
  ]);
}
