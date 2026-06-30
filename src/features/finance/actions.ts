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
  date?: string; // YYYY-MM-DD; default hoje
}

type Result = { ok: boolean; error?: string; demo?: boolean };

/**
 * Registra um gasto/recebimento. Para unificar com a aba Provisões, gravamos
 * como um lançamento já PAGO em `scheduled_transactions` na data escolhida —
 * assim ele aparece no Financeiro (via merge) e na projeção mensal de Provisões,
 * sem duplicar.
 */
export async function addTransaction(
  input: TransactionInput
): Promise<Result> {
  if (!input.amount || input.amount <= 0)
    return { ok: false, error: "Informe um valor válido." };

  const user = await getCurrentUser();
  if (!user) return { ok: true, demo: true };

  const supabase = createClient();
  const { error } = await supabase.from("scheduled_transactions").insert({
    user_id: user.id,
    type: input.type,
    amount: input.amount,
    category: input.category,
    description: input.description || null,
    due_date: input.date || new Date().toISOString().slice(0, 10),
    paid: true,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/finance");
  revalidatePath("/provisoes");
  revalidatePath("/");
  return { ok: true };
}
