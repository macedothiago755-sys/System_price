"use client";

import { useRouter } from "next/navigation";
import { TrendingUp, Trash2 } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/utils";
import type { Investment } from "@/lib/types";
import { deleteInvestment } from "./actions";

const typeLabels: Record<string, string> = {
  fixed_income: "Renda Fixa",
  stock: "Ações / ETF",
  real_estate: "Imobiliário",
  crypto: "Cripto",
  fund: "Fundos",
  vehicle: "Veículo",
  property: "Imóvel",
};

const typeColors: Record<string, string> = {
  fixed_income: "bg-primary",
  stock: "bg-accent",
  real_estate: "bg-sky-400",
  crypto: "bg-amber-400",
  fund: "bg-rose-400",
  vehicle: "bg-orange-400",
  property: "bg-teal-400",
};

export function Portfolio({
  investments,
  total,
}: {
  investments: Investment[];
  total: number;
}) {
  const router = useRouter();

  async function remove(id: string) {
    await deleteInvestment(id);
    router.refresh();
  }

  const byType = new Map<string, number>();
  for (const i of investments) {
    const key = i.asset_type ?? "fund";
    byType.set(key, (byType.get(key) ?? 0) + i.amount);
  }
  const distribution = [...byType.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardTitle className="mb-2">Patrimônio</CardTitle>
        <p className="text-3xl font-semibold">{formatBRL(total)}</p>
        <p className="mt-1 flex items-center gap-1 text-sm text-primary">
          <TrendingUp className="h-4 w-4" /> {investments.length} ativos
        </p>

        <div className="mt-5 space-y-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Distribuição
          </p>
          {distribution.map(([type, amount]) => (
            <div key={type}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{typeLabels[type] ?? type}</span>
                <span className="text-muted-foreground">
                  {total > 0 ? Math.round((amount / total) * 100) : 0}%
                </span>
              </div>
              <Progress
                value={total > 0 ? (amount / total) * 100 : 0}
                indicatorClassName={typeColors[type] ?? "bg-muted-foreground"}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <CardTitle className="mb-3">Carteira</CardTitle>
        <div className="space-y-2">
          {investments.map((i) => (
            <div
              key={i.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-secondary/30 p-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{i.name}</p>
                <p className="text-xs text-muted-foreground">
                  {typeLabels[i.asset_type ?? "fund"] ?? i.asset_type}
                  {i.goal ? ` · ${i.goal}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {i.yield_pct != null && (
                  <Badge variant={i.yield_pct >= 0 ? "primary" : "destructive"}>
                    {i.yield_pct >= 0 ? "+" : ""}
                    {i.yield_pct}%
                  </Badge>
                )}
                <span className="text-sm font-medium">
                  {formatBRL(i.amount)}
                </span>
                <button
                  onClick={() => remove(i.id)}
                  title="Remover ativo"
                  className="text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {investments.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Cadastre seus ativos para acompanhar a evolução.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
