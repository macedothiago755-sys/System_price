// Shared domain types. Once the DB is live, generate the source-of-truth types
// with: `supabase gen types typescript` and re-export from here.

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "done" | "archived";
export type EnergyLevel = "low" | "medium" | "high";
export type TaskCategory =
  | "work"
  | "personal"
  | "health"
  | "finance"
  | "learning";
export type Mood = "great" | "ok" | "bad";
export type TxType = "income" | "expense";

export interface ScheduledTransaction {
  id: string;
  type: TxType;
  amount: number;
  category: string | null;
  description: string | null;
  due_date: string;
  paid: boolean;
  group_id: string | null;
  installment_no: number | null;
  installment_total: number | null;
}

export interface Investment {
  id: string;
  name: string;
  asset_type: string | null;
  amount: number;
  yield_pct: number | null;
  goal: string | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  kind: string; // meeting | focus_block | appointment
  starts_at: string;
  ends_at: string | null;
  source: string;
}

export type GoalCategory =
  | "finance"
  | "health"
  | "career"
  | "relationship"
  | "learning";

export interface Goal {
  id: string;
  title: string;
  category: GoalCategory;
  target_value: number | null;
  current_value: number | null;
  unit: string | null;
  deadline: string | null;
  status: string;
}

export interface Project {
  id: string;
  name: string;
  objective: string | null;
  status: string;
  deadline: string | null;
}

export interface Note {
  id: string;
  title: string | null;
  content: string | null;
  kind: string;
  tags: string[];
  created_at?: string;
}

export interface MeetingActionItem {
  task: string;
  owner: string | null;
  due: string | null;
}

export interface Meeting {
  id: string;
  title: string | null;
  summary: string | null;
  decisions: string[];
  action_items: MeetingActionItem[];
  created_at?: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  streak_days: number;
}

export interface DailyCheckin {
  id: string;
  date: string;
  energy: number | null;
  mood: Mood | null;
  sleep_hours: number | null;
  focus: number | null;
  main_concern: string | null;
  win_of_day: string | null;
}

export interface Task {
  id: string;
  parent_id: string | null;
  title: string;
  description: string | null;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  energy_required: EnergyLevel;
  estimated_min: number | null;
  blocker: string | null;
  due_date: string | null;
}

export interface HealthMetric {
  date: string;
  sleep_score: number | null;
  sleep_duration: number | null;
  recovery_score: number | null;
  heart_rate: number | null;
  hrv: number | null;
  training_load: number | null;
  steps: number | null;
  calories: number | null;
  cardio_status?: string | null;
  strain?: number | null;
  tolerance?: number | null;
  workout_sport?: string | null;
  workout_minutes?: number | null;
}

export interface AiInsight {
  id: string;
  source_module: string | null;
  title: string | null;
  body: string;
  confidence: number;
}

/** XP needed to reach the next level (gentle exponential curve). */
export function xpForLevel(level: number): number {
  return Math.round(100 * Math.pow(level, 1.5));
}
