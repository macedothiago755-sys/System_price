import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

/**
 * A compact snapshot of the user's recent life, injected into AI prompts so the
 * assistant answers with real context instead of generic advice.
 *
 * Kept small on purpose (recent rows only) to control token usage.
 */
export interface UserContext {
  profile: { level: number; xp: number; streak_days: number } | null;
  recentCheckins: Array<{
    date: string;
    energy: number | null;
    focus: number | null;
    mood: string | null;
    sleep_hours: number | null;
  }>;
  latestHealth: Record<string, unknown> | null;
  openTasks: Array<{ title: string; priority: string; category: string }>;
  finance30d: { income: number; expense: number } | null;
  upcomingDebts: {
    pendingTotal: number;
    next: Array<{ description: string | null; amount: number; due: string }>;
  } | null;
  goals: Array<{ title: string; category: string; current: number | null; target: number | null }>;
}

const since = (days: number) =>
  new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

/** Build the context snapshot for the current user, or null in demo mode. */
export async function buildUserContext(): Promise<UserContext | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const [profile, checkins, health, tasks, tx, sched, goals] = await Promise.all([
    supabase
      .from("profiles")
      .select("level, xp, streak_days")
      .eq("id", user.id)
      .single(),
    supabase
      .from("daily_checkins")
      .select("date, energy, focus, mood, sleep_hours")
      .eq("user_id", user.id)
      .gte("date", since(14))
      .order("date", { ascending: false }),
    supabase
      .from("health_metrics")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("tasks")
      .select("title, priority, category")
      .eq("user_id", user.id)
      .in("status", ["todo", "in_progress"])
      .limit(20),
    supabase
      .from("financial_transactions")
      .select("type, amount")
      .eq("user_id", user.id)
      .gte("date", since(30)),
    supabase
      .from("scheduled_transactions")
      .select("description, amount, due_date")
      .eq("user_id", user.id)
      .eq("type", "expense")
      .eq("paid", false)
      .order("due_date", { ascending: true }),
    supabase
      .from("goals")
      .select("title, category, current_value, target_value")
      .eq("user_id", user.id)
      .eq("status", "active"),
  ]);

  const finance30d = (tx.data ?? []).reduce(
    (acc, t: { type: string; amount: number }) => {
      if (t.type === "income") acc.income += Number(t.amount);
      else acc.expense += Number(t.amount);
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const debts = (sched.data ?? []) as Array<{
    description: string | null;
    amount: number;
    due_date: string;
  }>;
  const upcomingDebts = debts.length
    ? {
        pendingTotal: debts.reduce((s, d) => s + Number(d.amount), 0),
        next: debts.slice(0, 5).map((d) => ({
          description: d.description,
          amount: Number(d.amount),
          due: d.due_date,
        })),
      }
    : null;

  return {
    profile: profile.data ?? null,
    recentCheckins: checkins.data ?? [],
    latestHealth: health.data ?? null,
    openTasks: tasks.data ?? [],
    finance30d: tx.data ? finance30d : null,
    upcomingDebts,
    goals: (goals.data ?? []).map(
      (g: {
        title: string;
        category: string;
        current_value: number | null;
        target_value: number | null;
      }) => ({
        title: g.title,
        category: g.category,
        current: g.current_value,
        target: g.target_value,
      })
    ),
  };
}
