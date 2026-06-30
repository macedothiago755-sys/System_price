"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { TxType } from "@/lib/types";

type Result = { ok: boolean; error?: string; demo?: boolean };

export interface ScheduledInput {
  type: TxType;
  amount: number;
  category: string;
  description: string;
  first_due_date: string; // YYYY-MM-DD
  count: number; // 1 = único; >1 = parcelas/recorrência mensal
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Add `n` months to a date, clamping the day to the month's last day. */
function addMonths(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const base = new Date(y, m - 1 + n, 1);
  const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const day = Math.min(d, lastDay);
  return `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(day)}`;
}

function refresh() {
  revalidatePath("/provisoes");
  revalidatePath("/finance");
  revalidatePath("/");
}

/** Create one entry, or a series of monthly installments sharing a group. */
export async function addScheduled(input: ScheduledInput): Promise<Result> {
  if (!input.amount || input.amount <= 0)
    return { ok: false, error: "Informe um valor válido." };
  if (!input.first_due_date)
    return { ok: false, error: "Informe a data de vencimento." };

  const total = Math.max(1, Math.floor(input.count || 1));

  const user = await getCurrentUser();
  if (!user) return { ok: true, demo: true };

  const supabase = createClient();
  const groupId =
    total > 1 ? crypto.randomUUID() : null;

  const rows = Array.from({ length: total }, (_, i) => ({
    user_id: user.id,
    type: input.type,
    amount: input.amount,
    category: input.category || null,
    description:
      total > 1
        ? `${input.description || "Parcela"} ${i + 1}/${total}`
        : input.description || null,
    due_date: addMonths(input.first_due_date, i),
    group_id: groupId,
    installment_no: total > 1 ? i + 1 : null,
    installment_total: total > 1 ? total : null,
  }));

  const { error } = await supabase.from("scheduled_transactions").insert(rows);
  if (error) return { ok: false, error: error.message };

  refresh();
  return { ok: true };
}

export async function toggleScheduledPaid(
  id: string,
  paid: boolean
): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: true, demo: true };

  const supabase = createClient();
  const { error } = await supabase
    .from("scheduled_transactions")
    .update({ paid })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}

export async function deleteScheduled(
  id: string,
  groupId?: string | null
): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: true, demo: true };

  const supabase = createClient();
  const query = supabase
    .from("scheduled_transactions")
    .delete()
    .eq("user_id", user.id);

  // Delete the whole installment series when a group is given.
  const { error } = groupId
    ? await query.eq("group_id", groupId)
    : await query.eq("id", id);

  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}
