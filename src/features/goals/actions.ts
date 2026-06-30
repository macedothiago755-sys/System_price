"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { GoalCategory } from "@/lib/types";

type Result = { ok: boolean; error?: string; demo?: boolean };

export interface GoalInput {
  title: string;
  category: GoalCategory;
  target_value: number;
  current_value: number;
  unit: string;
  deadline: string | null;
}

export async function createGoal(input: GoalInput): Promise<Result> {
  if (!input.title.trim()) return { ok: false, error: "Informe um título." };

  const user = await getCurrentUser();
  if (!user) return { ok: true, demo: true };

  const supabase = createClient();
  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    title: input.title,
    category: input.category,
    target_value: input.target_value || null,
    current_value: input.current_value || 0,
    unit: input.unit || null,
    deadline: input.deadline || null,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/goals");
  return { ok: true };
}

export async function deleteGoal(id: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: true, demo: true };

  const supabase = createClient();
  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/goals");
  return { ok: true };
}

export async function updateGoalProgress(
  id: string,
  current: number
): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: true, demo: true };

  const supabase = createClient();
  const { error } = await supabase
    .from("goals")
    .update({ current_value: current })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/goals");
  return { ok: true };
}
