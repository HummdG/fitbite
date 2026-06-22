import { createContext, ReactNode, useContext, useState } from 'react';

import type { ActivityLevel, Gender, Goal, MacroKey, Strictness, Targets } from '@/types/api';

export const DEFAULT_DASHBOARD_WIDGETS: MacroKey[] = ['calories', 'protein', 'carbs', 'fat'];

export type OnboardingDraft = {
  gender: Gender | null;
  age: string;
  height_cm: string;
  current_weight_kg: string;
  target_weight_kg: string;
  activity_level: ActivityLevel | null;
  dietary_prefs: string[];
  allergies: string;
  goal: Goal | null;
  strictness: Strictness;
  // Computed on the "Your goal" step, displayed + saved on the "Your targets" step.
  targets: Targets | null;
  dashboard_widgets: MacroKey[];
};

const DEFAULT_DRAFT: OnboardingDraft = {
  gender: null,
  age: '',
  height_cm: '',
  current_weight_kg: '',
  target_weight_kg: '',
  activity_level: null,
  dietary_prefs: [],
  allergies: '',
  goal: null,
  strictness: 'balanced',
  targets: null,
  dashboard_widgets: DEFAULT_DASHBOARD_WIDGETS,
};

type Ctx = {
  draft: OnboardingDraft;
  update: (patch: Partial<OnboardingDraft>) => void;
};

const OnboardingContext = createContext<Ctx>({ draft: DEFAULT_DRAFT, update: () => {} });

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<OnboardingDraft>(DEFAULT_DRAFT);
  const update = (patch: Partial<OnboardingDraft>) => setDraft((prev) => ({ ...prev, ...patch }));
  return <OnboardingContext.Provider value={{ draft, update }}>{children}</OnboardingContext.Provider>;
}

export const useOnboarding = () => useContext(OnboardingContext);
