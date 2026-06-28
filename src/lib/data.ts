import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import {
  mockProfile,
  mockCheckin,
  mockHealth,
  mockInsights,
  mockTasks,
  mockPriorities,
  mockTransactions,
  mockInvestments,
  mockHealthHistory,
  mockGoals,
  mockProjects,
  mockNotes,
  mockScheduled,
} from "@/lib/mock-data";
import type {
  Profile,
  DailyCheckin,
  HealthMetric,
  AiInsight,
  Task,
  EnergyLevel,
  Investment,
  Goal,
  Project,
  Note,
  ScheduledTransaction,
  CalendarEvent,
} from "@/lib/types";
import {
  buildProjection,
  forecastTotals,
  type MonthProjection,
  type ForecastTotals,
} from "@/lib/forecast";
import {
  summarize,
  financialHealthScore,
  type Transaction,
  type FinanceSummary,
} from "@/lib/finance";

const today = () => new Date().toISOString().slice(0, 10);

export interface Priority {
  id: string;
  title: string;
  estimated_min: number | null;
  energy: EnergyLevel;
  reason: string;
}

export interface DashboardData {
  demo: boolean;
  profile: Pick<Profile, "full_name" | "xp" | "level" | "streak_days">;
  checkin: DailyCheckin | null;
  health: HealthMetric | null;
  tasks: Task[];
  priorities: Priority[];
  insights: AiInsight[];
}

const priorityRank: Record<Task["priority"], number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const energyReason: Record<EnergyLevel, string> = {
  high: "Exige energia alta — encaixe no seu pico de foco.",
  medium: "Energia moderada — bom para a primeira metade do dia.",
  low: "Tarefa leve — agrupe com outras rápidas.",
};

/** Top 3 open tasks turned into prioritized dashboard items. */
export function tasksToPriorities(tasks: Task[]): Priority[] {
  return tasks
    .filter((t) => t.status !== "done" && t.status !== "archived")
    .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])
    .slice(0, 3)
    .map((t) => ({
      id: t.id,
      title: t.title,
      estimated_min: t.estimated_min,
      energy: t.energy_required,
      reason: energyReason[t.energy_required],
    }));
}

/** Everything the dashboard needs in one round-trip. Falls back to demo data. */
export async function getDashboardData(): Promise<DashboardData> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      demo: true,
      profile: mockProfile,
      checkin: mockCheckin,
      health: mockHealth,
      tasks: mockTasks,
      priorities: mockPriorities,
      insights: mockInsights,
    };
  }

  const supabase = createClient();
  const [profileRes, checkinRes, healthRes, tasksRes, insightsRes] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("daily_checkins")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today())
        .maybeSingle(),
      supabase
        .from("health_metrics")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .neq("status", "archived")
        .order("position", { ascending: true }),
      supabase
        .from("ai_insights")
        .select("*")
        .eq("user_id", user.id)
        .eq("dismissed", false)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

  const tasks = (tasksRes.data as Task[]) ?? [];

  return {
    demo: false,
    profile: (profileRes.data as Profile) ?? mockProfile,
    checkin: (checkinRes.data as DailyCheckin) ?? null,
    health: (healthRes.data as HealthMetric) ?? null,
    tasks,
    priorities: tasksToPriorities(tasks),
    insights: (insightsRes.data as AiInsight[]) ?? [],
  };
}

/** Tasks list for the Tasks page. */
export async function getTasks(): Promise<{ tasks: Task[]; demo: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { tasks: mockTasks, demo: true };

  const supabase = createClient();
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .neq("status", "archived")
    .order("position", { ascending: true });

  return { tasks: (data as Task[]) ?? [], demo: false };
}

const since = (days: number) =>
  new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

export interface FinanceData {
  demo: boolean;
  transactions: Transaction[];
  summary: FinanceSummary;
  score: number;
}

/**
 * Finance dashboard: last-30d transactions + provisões marcadas como pagas no
 * período (entram como gasto/recebido real) + summary + health score.
 */
export async function getFinanceData(): Promise<FinanceData> {
  const user = await getCurrentUser();
  if (!user) {
    const summary = summarize(mockTransactions);
    return {
      demo: true,
      transactions: mockTransactions,
      summary,
      score: financialHealthScore(summary),
    };
  }

  const supabase = createClient();
  const [txRes, paidRes] = await Promise.all([
    supabase
      .from("financial_transactions")
      .select("id, type, amount, category, description, date")
      .eq("user_id", user.id)
      .gte("date", since(30))
      .order("date", { ascending: false }),
    // Provisões já pagas/recebidas no período viram lançamentos reais.
    supabase
      .from("scheduled_transactions")
      .select("id, type, amount, category, description, due_date")
      .eq("user_id", user.id)
      .eq("paid", true)
      .gte("due_date", since(30)),
  ]);

  const real = ((txRes.data as Transaction[]) ?? []).map((t) => ({
    ...t,
    amount: Number(t.amount),
  }));

  const fromProvisions: Transaction[] = (
    (paidRes.data as Array<{
      id: string;
      type: Transaction["type"];
      amount: number;
      category: string | null;
      description: string | null;
      due_date: string;
    }>) ?? []
  ).map((p) => ({
    id: `sched-${p.id}`,
    type: p.type,
    amount: Number(p.amount),
    category: p.category ?? "outros",
    description: p.description ? `${p.description} (provisão)` : "Provisão",
    date: p.due_date,
  }));

  const transactions = [...real, ...fromProvisions].sort((a, b) =>
    a.date < b.date ? 1 : -1
  );

  const summary = summarize(transactions);
  return {
    demo: false,
    transactions,
    summary,
    score: financialHealthScore(summary),
  };
}

export interface InvestmentsData {
  demo: boolean;
  investments: Investment[];
  total: number;
}

/** Portfolio: assets + total net worth. */
export async function getInvestmentsData(): Promise<InvestmentsData> {
  const user = await getCurrentUser();
  const investments = await (async () => {
    if (!user) return mockInvestments;
    const supabase = createClient();
    const { data } = await supabase
      .from("investments")
      .select("id, name, asset_type, amount, yield_pct, goal")
      .eq("user_id", user.id)
      .order("amount", { ascending: false });
    return ((data as Investment[]) ?? []).map((i) => ({
      ...i,
      amount: Number(i.amount),
    }));
  })();

  return {
    demo: !user,
    investments,
    total: investments.reduce((s, i) => s + i.amount, 0),
  };
}

export interface HealthData {
  demo: boolean;
  latest: HealthMetric | null;
  history: HealthMetric[];
}

/** Health dashboard: latest metrics + trailing history for charts. */
export async function getHealthData(): Promise<HealthData> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      demo: true,
      latest: mockHealthHistory[mockHealthHistory.length - 1],
      history: mockHealthHistory,
    };
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("health_metrics")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", since(14))
    .order("date", { ascending: true });

  const history = (data as HealthMetric[]) ?? [];
  return {
    demo: false,
    latest: history.length ? history[history.length - 1] : null,
    history,
  };
}

/** Active goals. */
export async function getGoals(): Promise<{ goals: Goal[]; demo: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { goals: mockGoals, demo: true };

  const supabase = createClient();
  const { data } = await supabase
    .from("goals")
    .select("id, title, category, target_value, current_value, unit, deadline, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return { goals: (data as Goal[]) ?? [], demo: false };
}

/** Projects for the Work Hub. */
export async function getProjects(): Promise<{
  projects: Project[];
  demo: boolean;
}> {
  const user = await getCurrentUser();
  if (!user) return { projects: mockProjects, demo: true };

  const supabase = createClient();
  const { data } = await supabase
    .from("projects")
    .select("id, name, objective, status, deadline")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return { projects: (data as Project[]) ?? [], demo: false };
}

export interface ForecastData {
  demo: boolean;
  entries: ScheduledTransaction[];
  projection: MonthProjection[];
  totals: ForecastTotals;
}

/** Provisões: scheduled future income/expense + monthly cash-flow projection. */
export async function getForecast(): Promise<ForecastData> {
  const user = await getCurrentUser();
  const entries = await (async () => {
    if (!user) return mockScheduled;
    const supabase = createClient();
    const { data } = await supabase
      .from("scheduled_transactions")
      .select(
        "id, type, amount, category, description, due_date, paid, group_id, installment_no, installment_total"
      )
      .eq("user_id", user.id)
      .order("due_date", { ascending: true });
    return ((data as ScheduledTransaction[]) ?? []).map((e) => ({
      ...e,
      amount: Number(e.amount),
    }));
  })();

  return {
    demo: !user,
    entries,
    projection: buildProjection(entries),
    totals: forecastTotals(entries.filter((e) => !e.paid)),
  };
}

/** Upcoming calendar events (next 30 days). */
export async function getEvents(): Promise<{
  events: CalendarEvent[];
  demo: boolean;
}> {
  const user = await getCurrentUser();
  if (!user) return { events: [], demo: true };

  const supabase = createClient();
  const { data } = await supabase
    .from("calendar_events")
    .select("id, title, kind, starts_at, ends_at, source")
    .eq("user_id", user.id)
    .gte("starts_at", new Date(Date.now() - 86_400_000).toISOString())
    .order("starts_at", { ascending: true });

  return { events: (data as CalendarEvent[]) ?? [], demo: false };
}

/** Knowledge Hub notes. */
export async function getNotes(): Promise<{ notes: Note[]; demo: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { notes: mockNotes, demo: true };

  const supabase = createClient();
  const { data } = await supabase
    .from("notes")
    .select("id, title, content, kind, tags, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return { notes: (data as Note[]) ?? [], demo: false };
}
