"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

type Result = { ok: boolean; error?: string; demo?: boolean };

export async function createNote(input: {
  title: string;
  content: string;
  kind: string;
  tags: string[];
}): Promise<Result> {
  if (!input.content.trim() && !input.title.trim())
    return { ok: false, error: "Escreva algo." };

  const user = await getCurrentUser();
  if (!user) return { ok: true, demo: true };

  const supabase = createClient();
  const { error } = await supabase.from("notes").insert({
    user_id: user.id,
    title: input.title || null,
    content: input.content || null,
    kind: input.kind,
    tags: input.tags,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/knowledge");
  return { ok: true };
}
