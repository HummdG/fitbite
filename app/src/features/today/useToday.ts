import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { FoodLogRow, ScoredDish } from '@/types/api';

/** Local (device-timezone) date key, e.g. "2026-06-10" — the day boundary the user sees. */
export function localDateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export type Totals = { calories: number; protein_g: number; fibre_g: number };

export function useToday(userId: string | undefined) {
  const logDate = localDateKey();
  return useQuery({
    queryKey: ['today', userId, logDate],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_log')
        .select('*')
        .eq('user_id', userId!)
        .eq('log_date', logDate)
        .order('logged_at', { ascending: true });
      if (error) throw error;
      const rows = (data as FoodLogRow[]) ?? [];
      const totals = rows.reduce<Totals>(
        (acc, r) => ({
          calories: acc.calories + r.calories,
          protein_g: acc.protein_g + r.protein_g,
          fibre_g: acc.fibre_g + r.fibre_g,
        }),
        { calories: 0, protein_g: 0, fibre_g: 0 },
      );
      return { rows, totals, logDate };
    },
  });
}

export type AddToTodayInput = {
  name: string;
  calories: number;
  protein_g: number;
  fibre_g: number;
  source_scan_id?: string | null;
  modifications?: string[];
};

export function dishToLogInput(dish: ScoredDish, scanId?: string): AddToTodayInput {
  return {
    name: dish.name,
    calories: dish.calories.point,
    protein_g: dish.protein_g.point,
    fibre_g: dish.fibre_g.point,
    source_scan_id: scanId ?? null,
    modifications: dish.modifications,
  };
}

export function useAddToToday(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: AddToTodayInput) => {
      const { error } = await supabase.from('food_log').insert({
        user_id: userId,
        log_date: localDateKey(),
        name: input.name,
        calories: input.calories,
        protein_g: input.protein_g,
        fibre_g: input.fibre_g,
        source_scan_id: input.source_scan_id ?? null,
        modifications: input.modifications ?? [],
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['today', userId] });
    },
  });
}
