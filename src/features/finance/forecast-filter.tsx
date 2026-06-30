"use client";

import { useRouter } from "next/navigation";

function label(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" })
    .format(new Date(y, m - 1, 1))
    .replace(/^./, (c) => c.toUpperCase());
}

export function ForecastFilter({ from, to }: { from: string; to: string }) {
  const router = useRouter();

  function go(nf: string, nt: string) {
    // mantém a ordem cronológica
    const [a, b] = nf <= nt ? [nf, nt] : [nt, nf];
    router.push(`/provisoes?from=${a}&to=${b}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-muted-foreground">De</span>
      <input
        type="month"
        value={from}
        onChange={(e) => e.target.value && go(e.target.value, to)}
        className="h-9 rounded-lg border border-border bg-secondary/40 px-2 text-sm focus:border-primary focus:outline-none"
      />
      <span className="text-muted-foreground">até</span>
      <input
        type="month"
        value={to}
        onChange={(e) => e.target.value && go(from, e.target.value)}
        className="h-9 rounded-lg border border-border bg-secondary/40 px-2 text-sm focus:border-primary focus:outline-none"
      />
      <span className="ml-1 hidden text-xs text-muted-foreground md:inline">
        {label(from)} → {label(to)}
      </span>
    </div>
  );
}
