"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EXPENSE_CATEGORIES, categoryLabel } from "@/lib/finance";
import type { TxType } from "@/lib/types";
import { addTransaction } from "./actions";

export function TransactionForm() {
  const router = useRouter();
  const [type, setType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>("alimentacao");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await addTransaction({
      type,
      amount: Number(amount),
      category: type === "income" ? "receita" : category,
      description,
      date,
    });
    setSaving(false);
    setAmount("");
    setDescription("");
    router.refresh();
  }

  return (
    <Card>
      <h2 className="mb-3 text-sm font-medium">Nova transação</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {(["expense", "income"] as TxType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "rounded-lg border py-2 text-sm font-medium transition-all",
                type === t
                  ? t === "income"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-rose-400/50 bg-rose-400/10 text-rose-400"
                  : "border-border bg-secondary/40 text-muted-foreground"
              )}
            >
              {t === "income" ? "Receita" : "Despesa"}
            </button>
          ))}
        </div>

        <input
          type="number"
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Valor (R$)"
          className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />

        {type === "expense" && (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {categoryLabel(c)}
              </option>
            ))}
          </select>
        )}

        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição (opcional)"
          className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />

        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Data (define o mês na aba Provisões)
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Adicionar
        </Button>
      </form>
    </Card>
  );
}
