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
} from "@/lib/mock-data";
import type {
  Profile,
  DailyCheckin,
  HealthMetric,
  AiInsight,
  Task,
  EnergyLevel,
  Investment,
} from "@/lib/types";
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

/** Finance dashboard: last-30d transactions + summary + health score. */
export async function getFinanceData(): Promise<FinanceData> {
  const user = await getCurrentUser();
  const transactions = await (async () => {
    if (!user) return mockTransactions;
    const supabase = createClient();
    const { data } = await supabase
      .from("financial_transactions")
      .select("id, type, amount, category, description, date")
      .eq("user_id", user.id)
      .gte("date", since(30))
      .order("date", { ascending: false });
    return ((data as Transaction[]) ?? []).map((t) => ({
      ...t,
      amount: Number(t.amount),
    }));
  })();

  const summary = summarize(transactions);
  return {
    demo: !user,
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
