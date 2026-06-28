"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { BASE_ROUTINE } from "@/lib/routine";

type Result = { ok: boolean; error?: string; demo?: boolean };

export interface RoutineInput {
  weekday: number;
  start_time: string;
  end_time: string;
  title: string;
  category: string;
  notes: string;
}

export async function addRoutineBlock(input: RoutineInput): Promise<Result> {
  if (!input.title.trim()) return { ok: false, error: "Informe a atividade." };

  const user = await getCurrentUser();
  if (!user) return { ok: true, demo: true };

  const supabase = createClient();
  const { error } = await supabase.from("routine_blocks").insert({
    user_id: user.id,
    weekday: input.weekday,
    start_time: input.start_time || null,
    end_time: input.end_time || null,
    title: input.title,
    category: input.category,
    notes: input.notes || null,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/rotina");
  return { ok: true };
}

export async function deleteRoutineBlock(id: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: true, demo: true };

  const supabase = createClient();
  const { error } = await supabase
    .from("routine_blocks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/rotina");
  return { ok: true };
}

/** One-click load of the full base routine (no AI). Replaces existing blocks. */
export async function seedBaseRoutine(): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: true, demo: true };

  const supabase = createClient();
  // Start clean so re-seeding doesn't duplicate.
  await supabase.from("routine_blocks").delete().eq("user_id", user.id);

  const rows = BASE_ROUTINE.map((b) => ({
    user_id: user.id,
    weekday: b.weekday,
    start_time: b.start_time,
    end_time: b.end_time,
    title: b.title,
    category: b.category,
    notes: b.notes ?? null,
  }));

  const { error } = await supabase.from("routine_blocks").insert(rows);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/rotina");
  return { ok: true };
}

export async function clearRoutine(): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: true, demo: true };

  const supabase = createClient();
  const { error } = await supabase
    .from("routine_blocks")
    .delete()
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/rotina");
  return { ok: true };
}
