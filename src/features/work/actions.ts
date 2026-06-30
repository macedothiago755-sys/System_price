"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { MeetingAnalysis } from "@/lib/ai/meeting";

type Result = { ok: boolean; error?: string; demo?: boolean };

export async function createProject(input: {
  name: string;
  objective: string;
  deadline: string | null;
}): Promise<Result> {
  if (!input.name.trim()) return { ok: false, error: "Informe o nome." };

  const user = await getCurrentUser();
  if (!user) return { ok: true, demo: true };

  const supabase = createClient();
  const { error } = await supabase.from("projects").insert({
    user_id: user.id,
    name: input.name,
    objective: input.objective || null,
    deadline: input.deadline || null,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/work");
  return { ok: true };
}

/** Persist an AI-analyzed meeting. */
export async function saveMeeting(
  analysis: MeetingAnalysis,
  raw: string
): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: true, demo: true };

  const supabase = createClient();
  const { error } = await supabase.from("meetings").insert({
    user_id: user.id,
    title: analysis.title,
    raw_notes: raw,
    summary: analysis.summary,
    decisions: analysis.decisions,
    action_items: analysis.action_items,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/work");
  return { ok: true };
}
