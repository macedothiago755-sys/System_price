"use client";

import { CalendarClock, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatBRL } from "@/lib/utils";
import type { ScheduledTransaction } from "@/lib/types";

const categoryLabels: Record<string, string> = {
  moradia: "Moradia",
  alimentacao: "Alimentação",
  transporte: "Transporte",
  lazer: "Lazer",
  estudos: "Estudos",
  saude: "Saúde",
  impostos: "Impostos",
  beleza: "Beleza",
  viagens: "Viagens",
  investimentos: "Investimentos",
  outros: "Outros",
};

function dueInfo(due: string): { label: string; overdue: boolean } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(due + "T00:00:00");
  const days = Math.round((d.getTime() - today.getTime()) / 86_400_000);
  if (days < 0) return { label: `atrasado ${-days}d`, overdue: true };
  if (days === 0) return { label: "hoje", overdue: false };
  if (days === 1) return { label: "amanhã", overdue: false };
  return { label: `em ${days}d`, overdue: false };
}

export function UpcomingBillsCard({
  bills,
  total,
}: {
  bills: ScheduledTransaction[];
  total: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos vencimentos</CardTitle>
        <CalendarClock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-2">
        {bills.length === 0 ? (
          <p className="py-3 text-center text-sm text-muted-foreground">
            Nenhuma conta a pagar pendente. 🎉
          </p>
        ) : (
          <>
            {bills.map((b) => {
              const info = dueInfo(b.due_date);
              return (
                <div
                  key={b.id}
                  className="flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/30 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">
                      {b.description || categoryLabels[b.category ?? ""] || "Conta"}
                    </p>
                    <p
                      className={`flex items-center gap-1 text-xs ${
                        info.overdue ? "text-destructive" : "text-muted-foreground"
                      }`}
                    >
                      {info.overdue && <AlertTriangle className="h-3 w-3" />}
                      {new Date(b.due_date + "T00:00:00").toLocaleDateString("pt-BR")} ·{" "}
                      {info.label}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-rose-400">
                    {formatBRL(b.amount)}
                  </span>
                </div>
              );
            })}
            <div className="flex items-center justify-between border-t border-border/60 pt-3 text-sm">
              <span className="text-muted-foreground">Total pendente</span>
              <span className="font-semibold text-rose-400">{formatBRL(total)}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
