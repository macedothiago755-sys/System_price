"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

type Result = { ok: boolean; error?: string; demo?: boolean };

export interface InvestmentInput {
  name: string;
  asset_type: string;
  amount: number;
  yield_pct: number | null;
  goal: string;
}

export async function createInvestment(
  input: InvestmentInput
): Promise<Result> {
  if (!input.name.trim()) return { ok: false, error: "Informe o nome do ativo." };
  if (!input.amount || input.amount <= 0)
    return { ok: false, error: "Informe um valor válido." };

  const user = await getCurrentUser();
  if (!user) return { ok: true, demo: true };

  const supabase = createClient();
  const { error } = await supabase.from("investments").insert({
    user_id: user.id,
    name: input.name,
    asset_type: input.asset_type,
    amount: input.amount,
    yield_pct: input.yield_pct,
    goal: input.goal || null,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/investments");
  return { ok: true };
}

export async function deleteInvestment(id: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: true, demo: true };

  const supabase = createClient();
  const { error } = await supabase
    .from("investments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/investments");
  return { ok: true };
}
