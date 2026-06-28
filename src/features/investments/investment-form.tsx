"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createInvestment } from "./actions";

const assetTypes = [
  { value: "fixed_income", label: "Renda Fixa" },
  { value: "stock", label: "Ações / ETF" },
  { value: "real_estate", label: "Imobiliário (FII)" },
  { value: "crypto", label: "Cripto" },
  { value: "fund", label: "Fundos" },
];

export function InvestmentForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [assetType, setAssetType] = useState("fixed_income");
  const [amount, setAmount] = useState("");
  const [yieldPct, setYieldPct] = useState("");
  const [goal, setGoal] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await createInvestment({
      name,
      asset_type: assetType,
      amount: Number(amount),
      yield_pct: yieldPct ? Number(yieldPct) : null,
      goal,
    });
    setSaving(false);
    if (!res.ok) return setError(res.error ?? "Erro ao salvar.");
    setName("");
    setAmount("");
    setYieldPct("");
    setGoal("");
    router.refresh();
  }

  return (
    <Card>
      <h2 className="mb-3 text-sm font-medium">Adicionar ativo</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome (ex: Tesouro Selic 2029)"
          className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <select
          value={assetType}
          onChange={(e) => setAssetType(e.target.value)}
          className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          {assetTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Valor (R$)"
            className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <input
            type="number"
            step="0.01"
            value={yieldPct}
            onChange={(e) => setYieldPct(e.target.value)}
            placeholder="Rentab. (%)"
            className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <input
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Objetivo (opcional)"
          className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Adicionar à carteira
        </Button>
      </form>
    </Card>
  );
}
