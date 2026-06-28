"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

type Result = { ok: boolean; error?: string; demo?: boolean };

export interface EventInput {
  title: string;
  kind: string;
  starts_at: string; // ISO
  ends_at: string | null;
}

export async function createEvent(input: EventInput): Promise<Result> {
  if (!input.title.trim()) return { ok: false, error: "Informe o título." };
  if (!input.starts_at) return { ok: false, error: "Informe data e hora." };

  const user = await getCurrentUser();
  if (!user) return { ok: true, demo: true };

  const supabase = createClient();
  const { error } = await supabase.from("calendar_events").insert({
    user_id: user.id,
    title: input.title,
    kind: input.kind,
    starts_at: input.starts_at,
    ends_at: input.ends_at,
    source: "manual",
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/agenda");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteEvent(id: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: true, demo: true };

  const supabase = createClient();
  const { error } = await supabase
    .from("calendar_events")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/agenda");
  revalidatePath("/");
  return { ok: true };
}
