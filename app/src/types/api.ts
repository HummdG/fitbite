// TypeScript mirrors of the FastAPI Pydantic models (service/app/models).

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Goal = 'lose_weight' | 'gain_weight' | 'eat_healthier' | 'high_protein';
export type Strictness = 'relaxed' | 'balanced' | 'strict';
export type Verdict =
  | 'great'
  | 'good_with_mods'
  | 'calorie_dense'
  | 'hard_to_track'
  | 'not_ideal';

export interface TargetRequest {
  gender: Gender;
  age: number;
  height_cm: number;
  current_weight_kg: number;
  activity_level: ActivityLevel;
  goal: Goal;
}

export interface Targets {
  calorie_target: number;
  protein_target_g: number;
  fibre_target_g: number;
  bmr: number;
  tdee: number;
}

export interface MacroEstimate {
  low: number;
  high: number;
  point: number;
}

export interface DietFlags {
  violates: string[];
  ok: boolean;
}

export interface ScoredDish {
  name: string;
  description: string | null;
  ingredients: string[];
  calories: MacroEstimate;
  protein_g: MacroEstimate;
  fibre_g: MacroEstimate;
  fit_score: number;
  verdict: Verdict;
  why: string;
  modifications: string[];
  diet_flags: DietFlags;
}

export interface TargetsSnapshot {
  calorie_target: number;
  protein_target_g: number;
  fibre_target_g: number;
  calories_remaining: number;
  protein_remaining_g: number;
  fibre_remaining_g: number;
}

export interface Consumed {
  calories: number;
  protein_g: number;
  fibre_g: number;
}

export interface ScanRequest {
  source: 'photo' | 'upload' | 'text';
  restaurant_name?: string | null;
  image_base64?: string | null;
  menu_text?: string | null;
  consumed?: Consumed;
}

export interface ScanResponse {
  scan_id: string;
  restaurant_name: string | null;
  targets_snapshot: TargetsSnapshot;
  best_match: ScoredDish | null;
  good_options: ScoredDish[];
  avoid: ScoredDish[];
  dishes: ScoredDish[];
}

// Row shapes for Supabase tables the app touches directly.
export interface ProfileRow {
  id: string;
  gender: Gender;
  age: number;
  height_cm: number;
  current_weight_kg: number;
  target_weight_kg: number | null;
  activity_level: ActivityLevel;
  goal: Goal;
  strictness: Strictness;
  dietary_prefs: string[];
  allergies: string[];
  calorie_target: number;
  protein_target_g: number;
  fibre_target_g: number;
}

export interface FoodLogRow {
  id: string;
  user_id: string;
  logged_at: string;
  log_date: string;
  name: string;
  calories: number;
  protein_g: number;
  fibre_g: number;
  source_scan_id: string | null;
  modifications: string[];
}
