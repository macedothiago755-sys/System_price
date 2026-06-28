"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { awardXp } from "@/lib/gamification";
import type { PlannedTask } from "@/lib/ai/planner";
import type { Task } from "@/lib/types";

type Result = { ok: boolean; error?: string; demo?: boolean };

/** Toggle a task between done/todo and award XP on completion. */
export async function toggleTask(id: string, done: boolean): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: true, demo: true };

  const supabase = createClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      status: done ? "done" : "todo",
      completed_at: done ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  if (done) await awardXp(supabase, user.id, "task_done");

  revalidatePath("/tasks");
  revalidatePath("/");
  return { ok: true };
}

/** Delete a task (e.g. created by mistake). */
export async function deleteTask(id: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: true, demo: true };

  const supabase = createClient();
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/tasks");
  revalidatePath("/");
  return { ok: true };
}

/** Delete every non-archived task at once (clean up bad imports). */
export async function clearAllTasks(): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: true, demo: true };

  const supabase = createClient();
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("user_id", user.id)
    .neq("status", "archived");

  if (error) return { ok: false, error: error.message };
  revalidatePath("/tasks");
  revalidatePath("/");
  return { ok: true };
}

/** Persist a batch of AI-planned tasks. Awards planning XP once. */
export async function savePlannedTasks(tasks: PlannedTask[]): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: true, demo: true };
  if (tasks.length === 0) return { ok: true };

  const supabase = createClient();
  const rows: Partial<Task & { user_id: string }>[] = tasks.map((t, i) => ({
    user_id: user.id,
    title: t.title,
    category: t.category,
    priority: t.priority,
    energy_required: t.energy_required,
    estimated_min: t.estimated_min,
    position: i,
  }));

  const { error } = await supabase.from("tasks").insert(rows);
  if (error) return { ok: false, error: error.message };

  await awardXp(supabase, user.id, "planning");
  revalidatePath("/tasks");
  return { ok: true };
}
