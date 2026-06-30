"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { awardXp } from "@/lib/gamification";
import type { Mood } from "@/lib/types";

export interface CheckinInput {
  energy: number;
  focus: number;
  mood: Mood;
  sleep_hours: number;
  main_concern: string;
  win_of_day: string;
}

export type ActionResult =
  | { ok: true; demo?: boolean; xp: number }
  | { ok: false; error: string };

/**
 * Save today's check-in (one per day) and award XP.
 * In demo mode (no Supabase / no session) it succeeds without persisting.
 */
export async function submitCheckin(input: CheckinInput): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: true, demo: true, xp: 25 };

  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { error } = await supabase.from("daily_checkins").upsert(
    {
      user_id: user.id,
      date: today,
      energy: input.energy,
      focus: input.focus,
      mood: input.mood,
      sleep_hours: input.sleep_hours,
      main_concern: input.main_concern || null,
      win_of_day: input.win_of_day || null,
    },
    { onConflict: "user_id,date" }
  );

  if (error) return { ok: false, error: error.message };

  await awardXp(supabase, user.id, "checkin");
  revalidatePath("/");
  return { ok: true, xp: 25 };
}
