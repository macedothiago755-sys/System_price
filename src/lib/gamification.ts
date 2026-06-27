import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type XpReason =
  | "checkin"
  | "task_done"
  | "workout"
  | "study"
  | "planning";

/** XP awarded per action. The DB trigger recomputes level + total. */
export const XP_VALUES: Record<XpReason, number> = {
  checkin: 25,
  task_done: 15,
  workout: 30,
  study: 20,
  planning: 10,
};

/** Insert an XP event; the `trg_xp_recompute` trigger updates the profile. */
export async function awardXp(
  supabase: SupabaseClient,
  userId: string,
  reason: XpReason
): Promise<void> {
  await supabase
    .from("xp_events")
    .insert({ user_id: userId, reason, amount: XP_VALUES[reason] });
}
