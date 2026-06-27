"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export interface HealthInput {
  sleep_duration: number;
  sleep_score: number;
  recovery_score: number;
  steps: number;
}

type Result = { ok: boolean; error?: string; demo?: boolean };

/** Manual health log (until Polar Flow sync lands). Upserts today's row. */
export async function logHealth(input: HealthInput): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: true, demo: true };

  const supabase = createClient();
  const { error } = await supabase.from("health_metrics").upsert(
    {
      user_id: user.id,
      date: new Date().toISOString().slice(0, 10),
      sleep_duration: input.sleep_duration,
      sleep_score: input.sleep_score,
      recovery_score: input.recovery_score,
      steps: input.steps,
      source: "manual",
    },
    { onConflict: "user_id,date" }
  );

  if (error) return { ok: false, error: error.message };
  revalidatePath("/health");
  revalidatePath("/");
  return { ok: true };
}
