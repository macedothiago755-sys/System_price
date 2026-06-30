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
  RoutineBlock,
} from "@/lib/types";
import { BASE_ROUTINE } from "@/lib/routine";
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
  month: string; // "YYYY-MM"
  transactions: Transaction[];
  summary: FinanceSummary;
  score: number;
}

/** First day of the month and first day of the next month (exclusive end). */
function monthBounds(month: string): { start: string; next: string } {
  const [y, m] = month.split("-").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  const start = `${y}-${pad(m)}-01`;
  const next = m === 12 ? `${y + 1}-01-01` : `${y}-${pad(m + 1)}-01`;
  return { start, next };
}

/**
 * Finance dashboard for a given month (default: mês atual). Inclui transações
 * reais + provisões marcadas como pagas naquele mês (entram como gasto/recebido)
 * + summary + health score.
 */
export async function getFinanceData(month?: string): Promise<FinanceData> {
  const m =
    month && /^\d{4}-\d{2}$/.test(month)
      ? month
      : new Date().toISOString().slice(0, 7);
  const { start, next } = monthBounds(m);

  const user = await getCurrentUser();
  if (!user) {
    const filtered = mockTransactions.filter(
      (t) => t.date >= start && t.date < next
    );
    const summary = summarize(filtered);
    return {
      demo: true,
      month: m,
      transactions: filtered,
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
      .gte("date", start)
      .lt("date", next)
      .order("date", { ascending: false }),
    // Provisões pagas/recebidas no mês escolhido viram lançamentos reais.
    supabase
      .from("scheduled_transactions")
      .select("id, type, amount, category, description, due_date")
      .eq("user_id", user.id)
      .eq("paid", true)
      .gte("due_date", start)
      .lt("due_date", next),
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
    description: p.description ?? "Lançamento",
    date: p.due_date,
  }));

  const transactions = [...real, ...fromProvisions].sort((a, b) =>
    a.date < b.date ? 1 : -1
  );

  const summary = summarize(transactions);
  return {
    demo: false,
    month: m,
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
  from: string; // "YYYY-MM"
  to: string; // "YYYY-MM"
  entries: ScheduledTransaction[];
  projection: MonthProjection[];
  totals: ForecastTotals;
}

const monthOf = (iso: string) => iso.slice(0, 7);
const validMonth = (m?: string) => (m && /^\d{4}-\d{2}$/.test(m) ? m : null);

/** Provisões: scheduled income/expense + monthly projection, filtrável por intervalo de meses. */
export async function getForecast(params?: {
  from?: string;
  to?: string;
}): Promise<ForecastData> {
  const user = await getCurrentUser();
  const all = await (async () => {
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

  const nowMonth = new Date().toISOString().slice(0, 7);
  const from = validMonth(params?.from) ?? nowMonth;
  // Default "to" = mês mais distante com lançamento (ou o próprio "from").
  const furthest = all.reduce((mx, e) => {
    const m = monthOf(e.due_date);
    return m > mx ? m : mx;
  }, from);
  const to = validMonth(params?.to) ?? furthest;

  const entries = all.filter((e) => {
    const m = monthOf(e.due_date);
    return m >= from && m <= to;
  });

  return {
    demo: !user,
    from,
    to,
    entries,
    projection: buildProjection(entries, { from, until: `${to}-01` }),
    totals: forecastTotals(entries.filter((e) => !e.paid)),
  };
}

/** Weekly routine blocks (recurring, by weekday). */
export async function getRoutine(): Promise<{
  blocks: RoutineBlock[];
  demo: boolean;
}> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      demo: true,
      blocks: BASE_ROUTINE.map((b, i) => ({
        id: `seed-${i}`,
        weekday: b.weekday,
        start_time: b.start_time,
        end_time: b.end_time,
        title: b.title,
        category: b.category,
        notes: b.notes ?? null,
      })),
    };
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("routine_blocks")
    .select("id, weekday, start_time, end_time, title, category, notes")
    .eq("user_id", user.id)
    .order("weekday", { ascending: true })
    .order("start_time", { ascending: true });

  return { blocks: (data as RoutineBlock[]) ?? [], demo: false };
}

/** Today's check-in (if any) + recent history. */
export async function getCheckins(): Promise<{
  today: DailyCheckin | null;
  history: DailyCheckin[];
  demo: boolean;
}> {
  const user = await getCurrentUser();
  if (!user) return { today: mockCheckin, history: [mockCheckin], demo: true };

  const todayStr = new Date().toISOString().slice(0, 10);
  const supabase = createClient();
  const { data } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(30);

  const rows = (data as DailyCheckin[]) ?? [];
  return {
    today: rows.find((r) => r.date === todayStr) ?? null,
    history: rows,
    demo: false,
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

export interface UpcomingBillsData {
  demo: boolean;
  bills: ScheduledTransaction[];
  monthTotal: number; // total pendente APENAS do mês em vigor
}

/** Total pendente a pagar só do mês atual, dado o conjunto de despesas não pagas. */
function currentMonthTotal(bills: ScheduledTransaction[]): number {
  const nowMonth = new Date().toISOString().slice(0, 7);
  return bills
    .filter((b) => b.due_date.slice(0, 7) === nowMonth)
    .reduce((s, b) => s + b.amount, 0);
}

/** Próximas contas a pagar (provisões de despesa não pagas), ordenadas por vencimento. */
export async function getUpcomingBills(): Promise<UpcomingBillsData> {
  const user = await getCurrentUser();
  if (!user) {
    const bills = mockScheduled
      .filter((e) => e.type === "expense" && !e.paid)
      .sort((a, b) => a.due_date.localeCompare(b.due_date));
    return {
      demo: true,
      bills: bills.slice(0, 6),
      monthTotal: currentMonthTotal(bills),
    };
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("scheduled_transactions")
    .select(
      "id, type, amount, category, description, due_date, paid, group_id, installment_no, installment_total"
    )
    .eq("user_id", user.id)
    .eq("type", "expense")
    .eq("paid", false)
    .order("due_date", { ascending: true });

  const bills = ((data as ScheduledTransaction[]) ?? []).map((b) => ({
    ...b,
    amount: Number(b.amount),
  }));

  return {
    demo: false,
    bills: bills.slice(0, 6),
    monthTotal: currentMonthTotal(bills),
  };
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
