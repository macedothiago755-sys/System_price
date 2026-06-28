"use client";

import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";
import { Check, Trash2, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/utils";
import type { ScheduledTransaction } from "@/lib/types";
import type { MonthProjection, ForecastTotals } from "@/lib/forecast";
import { toggleScheduledPaid, deleteScheduled } from "./forecast-actions";

export function ForecastView({
  entries,
  projection,
  totals,
}: {
  entries: ScheduledTransaction[];
  projection: MonthProjection[];
  totals: ForecastTotals;
}) {
  const router = useRouter();

  async function togglePaid(id: string, paid: boolean) {
    await toggleScheduledPaid(id, paid);
    router.refresh();
  }
  async function remove(e: ScheduledTransaction) {
    await deleteScheduled(e.id, e.group_id);
    router.refresh();
  }

  const chartData = projection.map((m) => ({
    label: m.label,
    net: m.net,
    accumulated: m.accumulated,
  }));

  const stats = [
    { label: "A receber", value: totals.income, icon: TrendingUp, color: "text-primary" },
    { label: "A pagar", value: totals.expense, icon: TrendingDown, color: "text-rose-400" },
    { label: "Saldo provisionado", value: totals.net, icon: Wallet, color: "text-accent" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <s.icon className={`mb-2 h-5 w-5 ${s.color}`} />
            <p className="text-xs text-muted-foreground">{s.label} (pendente)</p>
            <p className="text-xl font-semibold">{formatBRL(s.value)}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardTitle className="mb-4">Projeção mês a mês</CardTitle>
        {chartData.length > 0 ? (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="label" stroke="hsl(220 9% 60%)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(220 9% 60%)" fontSize={11} tickLine={false} axisLine={false} width={44} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ background: "hsl(224 13% 9%)", border: "1px solid hsl(224 12% 16%)", borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number, name) => [formatBRL(v), name === "net" ? "Saldo do mês" : "Acumulado"]}
                />
                <ReferenceLine y={0} stroke="hsl(224 12% 30%)" />
                <Bar dataKey="net" radius={[4, 4, 0, 0]}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={d.net >= 0 ? "hsl(152 60% 50%)" : "hsl(0 72% 56%)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Lance suas provisões para ver a projeção.
          </p>
        )}

        {projection.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Mês</th>
                  <th className="py-2 pr-4 text-right font-medium">A receber</th>
                  <th className="py-2 pr-4 text-right font-medium">A pagar</th>
                  <th className="py-2 pr-4 text-right font-medium">Saldo</th>
                  <th className="py-2 text-right font-medium">Acumulado</th>
                </tr>
              </thead>
              <tbody>
                {projection.map((m) => (
                  <tr key={m.key} className="border-t border-border/40">
                    <td className="py-2 pr-4 capitalize">{m.label}</td>
                    <td className="py-2 pr-4 text-right text-primary">{m.income ? formatBRL(m.income) : "—"}</td>
                    <td className="py-2 pr-4 text-right text-rose-400">{m.expense ? formatBRL(m.expense) : "—"}</td>
                    <td className={`py-2 pr-4 text-right ${m.net >= 0 ? "text-foreground" : "text-rose-400"}`}>{formatBRL(m.net)}</td>
                    <td className={`py-2 text-right font-medium ${m.accumulated >= 0 ? "text-primary" : "text-destructive"}`}>{formatBRL(m.accumulated)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <CardTitle className="mb-3">Lançamentos provisionados</CardTitle>
        <div className="space-y-2">
          {entries.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma provisão ainda.
            </p>
          )}
          {entries.map((e) => (
            <div
              key={e.id}
              className={`flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/30 p-3 ${e.paid ? "opacity-50" : ""}`}
            >
              <button
                onClick={() => togglePaid(e.id, !e.paid)}
                title={e.paid ? "Marcar como pendente" : "Marcar como pago/recebido"}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${e.paid ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
              >
                {e.paid && <Check className="h-3.5 w-3.5" />}
              </button>

              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm ${e.paid ? "line-through" : ""}`}>
                  {e.description || (e.type === "income" ? "Recebimento" : "Pagamento")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(e.due_date).toLocaleDateString("pt-BR")}
                  {e.installment_total ? ` · parcela ${e.installment_no}/${e.installment_total}` : ""}
                </p>
              </div>

              <span className={`shrink-0 text-sm font-medium ${e.type === "income" ? "text-primary" : "text-rose-400"}`}>
                {e.type === "income" ? "+" : "−"}
                {formatBRL(e.amount)}
              </span>

              {e.installment_total && e.group_id ? (
                <button onClick={() => remove(e)} title="Remover toda a série" className="shrink-0 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={() => remove(e)} title="Remover" className="shrink-0 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {entries.some((e) => e.installment_total) && (
          <p className="mt-3 text-xs text-muted-foreground">
            🗑️ em parcelas remove a série inteira.
          </p>
        )}
      </Card>
    </div>
  );
}
