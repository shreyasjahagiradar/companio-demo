/**
 * TypeScript types matching the Supabase B2B database schema.
 *
 * Chain: client → report → snd_plan → diet_plan → day_plan
 */

export interface Client {
  id: string;
  name: string;
  gender: string;
  phone_number: string;
}

export interface Report {
  id: string;
  client_id: string;
  report_date: string;
}

export interface Supplement {
  id: string;
  name: string;
  purpose: string;
  timing: string;
  dosage: string;
  precautions: string;
  timingCategory?: string;
}

export interface DayPlan {
  id: string;
  day?: string;
  preMorning?: string;
  morning?: string;
  midMorning?: string;
  lunch?: string;
  earlyEvening?: string;
  night?: string;
  bedtime?: string;
}

export interface DietPlanVersion {
  id: string;
  versionNumber: number;
  dietNotes?: string;
  dayPlans: DayPlan[];
}

export interface SndPlan {
  id: string;
  report?: any;
  supplements: Supplement[];
  supplementNotes?: string;
  dietPlanVersions: DietPlanVersion[];
  versionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ParameterInfo {
  shortDescription: string;
  minValue: number;
  maxValue: number;
  standardMinValue: number;
  standardMaxValue: number;
  panelName: string;
}

export interface BloodMarker {
  parameterName: string;
  value: string;
  units: string;
  result: 'OPTIMAL' | 'HIGH' | 'LOW' | 'NORMAL';
  deviation: number;
  reason: string | null;
  parameterInfo?: ParameterInfo;
}

export interface CompanionReport {
  id: string;
  reportDate: string;
  updatedAt: string;
  client: { name: string; gender: string; birthMonth: string };
  height?: number;
  weight?: number;
  waist?: number;
  bmi?: number;
  diet?: string;
  lifestyleHabits?: string[];
  existingConditions?: string[];
  bloodPanelListMap: Record<string, BloodMarker[]>;
  notes: string | null;
}

export interface CompanionDailyLog {
  id: string;
  client_id: string;
  log_date: string;
  checked_item_ids: string[];
  progress_percent: number;
  total_items: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}
