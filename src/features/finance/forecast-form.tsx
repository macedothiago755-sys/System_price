"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EXPENSE_CATEGORIES, categoryLabel } from "@/lib/finance";
import type { TxType } from "@/lib/types";
import { addScheduled } from "./forecast-actions";

/** Months from a YYYY-MM-DD date to a YYYY-MM month, inclusive (min 1). */
function monthsUntil(firstISO: string, untilMonth: string): number {
  if (!firstISO || !untilMonth) return 1;
  const [fy, fm] = firstISO.split("-").map(Number);
  const [uy, um] = untilMonth.split("-").map(Number);
  return Math.max(1, (uy - fy) * 12 + (um - fm) + 1);
}

export function ForecastForm() {
  const router = useRouter();
  const [type, setType] = useState<TxType>("expense");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("outros");
  const [amount, setAmount] = useState("");
  const [firstDue, setFirstDue] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [recurring, setRecurring] = useState(false);
  const [count, setCount] = useState("3");
  const [until, setUntil] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveCount = recurring ? Math.max(1, Number(count) || 1) : 1;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await addScheduled({
      type,
      amount: Number(amount),
      category: type === "income" ? "receita" : category,
      description,
      first_due_date: firstDue,
      count: effectiveCount,
    });
    setSaving(false);
    if (!res.ok) return setError(res.error ?? "Erro ao salvar.");
    setDescription("");
    setAmount("");
    router.refresh();
  }

  return (
    <Card>
      <h2 className="mb-3 text-sm font-medium">Lançar provisão</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {(["income", "expense"] as TxType[]).map((t) => (
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
              {t === "income" ? "A receber" : "A pagar"}
            </button>
          ))}
        </div>

        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={type === "income" ? "Ex: Salário, cliente X" : "Ex: Notebook, aluguel"}
          className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Valor por mês (R$)"
            className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          {type === "expense" ? (
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {categoryLabel(c)}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center px-1 text-xs text-muted-foreground">
              Recebimento
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            {recurring ? "1º vencimento" : "Vencimento"}
          </label>
          <input
            type="date"
            required
            value={firstDue}
            onChange={(e) => setFirstDue(e.target.value)}
            className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Repetir mensalmente (parcelas / recorrência)
        </label>

        {recurring && (
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-border/50 bg-secondary/20 p-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Nº de meses
              </label>
              <input
                type="number"
                min="1"
                value={count}
                onChange={(e) => {
                  setCount(e.target.value);
                  setUntil("");
                }}
                className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                ou repetir até
              </label>
              <input
                type="month"
                value={until}
                onChange={(e) => {
                  setUntil(e.target.value);
                  setCount(String(monthsUntil(firstDue, e.target.value)));
                }}
                className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <p className="col-span-2 text-xs text-muted-foreground">
              Serão criados <strong>{effectiveCount}</strong> lançamentos mensais
              de R$ {amount || "0"}.
            </p>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {recurring ? `Lançar ${effectiveCount}x` : "Lançar"}
        </Button>
      </form>
    </Card>
  );
}
