"use client";

import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScoreRing } from "@/components/ui/score-ring";
import { Progress } from "@/components/ui/progress";
import { formatBRL } from "@/lib/utils";
import type { FinanceSummary } from "@/lib/finance";

const categoryLabels: Record<string, string> = {
  moradia: "Moradia",
  alimentacao: "Alimentação",
  transporte: "Transporte",
  lazer: "Lazer",
  investimentos: "Investimentos",
  outros: "Outros",
};

function scoreColor(score: number) {
  if (score >= 70) return "hsl(var(--success))";
  if (score >= 40) return "hsl(var(--warning))";
  return "hsl(var(--destructive))";
}

export function FinanceDashboard({
  summary,
  score,
}: {
  summary: FinanceSummary;
  score: number;
}) {
  const stats = [
    { label: "Receita", value: summary.income, icon: TrendingUp, color: "text-primary" },
    { label: "Gastos", value: summary.expense, icon: TrendingDown, color: "text-rose-400" },
    { label: "Saldo", value: summary.balance, icon: Wallet, color: "text-accent" },
  ];

  const maxCat = summary.byCategory[0]?.total ?? 1;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <Card key={s.label}>
              <s.icon className={`mb-2 h-5 w-5 ${s.color}`} />
              <p className="text-xs text-muted-foreground">{s.label} (30d)</p>
              <p className="text-xl font-semibold">{formatBRL(s.value)}</p>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gastos por categoria</CardTitle>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <PiggyBank className="h-3 w-3" /> Taxa de investimento {summary.investRate}%
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.byCategory.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Sem despesas no período.
              </p>
            )}
            {summary.byCategory.map((c) => (
              <div key={c.category}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{categoryLabels[c.category] ?? c.category}</span>
                  <span className="text-muted-foreground">
                    {formatBRL(c.total)}
                  </span>
                </div>
                <Progress
                  value={(c.total / maxCat) * 100}
                  indicatorClassName={
                    c.category === "investimentos" ? "bg-primary" : "bg-accent"
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="flex flex-col items-center justify-center text-center">
        <CardTitle className="mb-4">Financial Health Score</CardTitle>
        <ScoreRing value={score} label="/ 100" color={scoreColor(score)} />
        <p className="mt-4 text-sm text-muted-foreground">
          {score >= 70
            ? "Saúde financeira sólida. Continue com os aportes."
            : score >= 40
              ? "No caminho. Reduza gastos variáveis para subir."
              : "Atenção: gastos consumindo a maior parte da renda."}
        </p>
      </Card>
    </div>
  );
}
