import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { ProfileRow } from '@/types/api';

/** Loads the signed-in user's profile row. Returns null if onboarding isn't done. */
export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', userId],
    enabled: !!userId,
    queryFn: async (): Promise<ProfileRow | null> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId!)
        .maybeSingle();
      if (error) throw error;
      return (data as ProfileRow | null) ?? null;
    },
  });
}
