"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export interface HealthInput {
  date?: string;
  sleep_duration: number | null;
  sleep_score: number | null;
  recovery_score: number | null;
  hrv: number | null;
  heart_rate: number | null;
  training_load: number | null;
  steps: number | null;
  calories: number | null;
}

type Result = { ok: boolean; error?: string; demo?: boolean };

/** Manual health log (until Polar Flow sync lands). Upserts the chosen day. */
export async function logHealth(input: HealthInput): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: true, demo: true };

  const supabase = createClient();
  const { error } = await supabase.from("health_metrics").upsert(
    {
      user_id: user.id,
      date: input.date || new Date().toISOString().slice(0, 10),
      sleep_duration: input.sleep_duration,
      sleep_score: input.sleep_score,
      recovery_score: input.recovery_score,
      hrv: input.hrv,
      heart_rate: input.heart_rate,
      training_load: input.training_load,
      steps: input.steps,
      calories: input.calories,
      source: "manual",
    },
    { onConflict: "user_id,date" }
  );

  if (error) return { ok: false, error: error.message };
  revalidatePath("/health");
  revalidatePath("/");
  return { ok: true };
}
