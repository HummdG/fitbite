import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { localDateKey, sumTotals, Totals, ZERO_TOTALS } from '@/features/today/useToday';
import type { FoodLogRow } from '@/types/api';

export type DayBucket = { date: string; rows: FoodLogRow[]; totals: Totals };

function startKey(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - (days - 1));
  return localDateKey(d);
}

/**
 * Loads the user's food_log over the trailing `days` window and buckets it by
 * local date. Powers the Log calendar (per-day rows) and Progress chart (trend).
 */
export function useHistory(userId: string | undefined, days = 90) {
  const since = startKey(days);
  return useQuery({
    queryKey: ['history', userId, days],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_log')
        .select('*')
        .eq('user_id', userId!)
        .gte('log_date', since)
        .order('logged_at', { ascending: true });
      if (error) throw error;
      const rows = (data as FoodLogRow[]) ?? [];

      const byDate = new Map<string, DayBucket>();
      for (const r of rows) {
        const bucket = byDate.get(r.log_date) ?? { date: r.log_date, rows: [], totals: { ...ZERO_TOTALS } };
        bucket.rows.push(r);
        byDate.set(r.log_date, bucket);
      }
      for (const bucket of byDate.values()) bucket.totals = sumTotals(bucket.rows);

      const buckets = Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
      return { rows, byDate, buckets, since };
    },
  });
}

/** A dense, gap-free series of daily totals for the last `days` (zero-filled). */
export function denseSeries(byDate: Map<string, DayBucket>, days: number): DayBucket[] {
  const out: DayBucket[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = localDateKey(d);
    out.push(byDate.get(key) ?? { date: key, rows: [], totals: { ...ZERO_TOTALS } });
  }
  return out;
}
