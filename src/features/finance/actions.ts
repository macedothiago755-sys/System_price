"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { TxType } from "@/lib/types";

export interface TransactionInput {
  type: TxType;
  amount: number;
  category: string;
  description: string;
}

type Result = { ok: boolean; error?: string; demo?: boolean };

export async function addTransaction(
  input: TransactionInput
): Promise<Result> {
  if (!input.amount || input.amount <= 0)
    return { ok: false, error: "Informe um valor válido." };

  const user = await getCurrentUser();
  if (!user) return { ok: true, demo: true };

  const supabase = createClient();
  const { error } = await supabase.from("financial_transactions").insert({
    user_id: user.id,
    type: input.type,
    amount: input.amount,
    category: input.category,
    description: input.description || null,
    date: new Date().toISOString().slice(0, 10),
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/finance");
  revalidatePath("/");
  return { ok: true };
}
