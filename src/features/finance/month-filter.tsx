"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

function shift(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function label(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" })
    .format(new Date(y, m - 1, 1))
    .replace(/^./, (c) => c.toUpperCase());
}

export function MonthFilter({ month }: { month: string }) {
  const router = useRouter();
  const go = (m: string) => router.push(`/finance?month=${m}`);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => go(shift(month, -1))}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-secondary"
        title="Mês anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="relative">
        <input
          type="month"
          value={month}
          onChange={(e) => e.target.value && go(e.target.value)}
          className="h-9 w-40 rounded-lg border border-border bg-secondary/40 px-3 text-center text-sm font-medium capitalize focus:border-primary focus:outline-none"
          aria-label="Selecionar mês"
        />
      </div>

      <button
        onClick={() => go(shift(month, 1))}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-secondary"
        title="Próximo mês"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <span className="ml-1 hidden text-sm capitalize text-muted-foreground sm:inline">
        {label(month)}
      </span>
    </div>
  );
}
