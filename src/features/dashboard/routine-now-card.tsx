"use client";

import { useEffect, useState } from "react";
import { Clock, ArrowRight, CalendarRange } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PILLARS, pillarLabel, WEEKDAYS } from "@/lib/routine";
import type { RoutineBlock } from "@/lib/types";

export function RoutineNowCard({ blocks }: { blocks: RoutineBlock[] }) {
  // Compute time-dependent state after mount to avoid hydration mismatch.
  const [now, setNow] = useState<string | null>(null);
  const [weekday, setWeekday] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
      );
      const wd = d.getDay();
      setWeekday(wd === 0 ? 7 : wd);
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  if (now === null || weekday === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rotina de hoje</CardTitle>
          <CalendarRange className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="skeleton h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const today = blocks
    .filter((b) => b.weekday === weekday)
    .sort((a, b) => (a.start_time ?? "").localeCompare(b.start_time ?? ""));

  const dayLabel = WEEKDAYS.find((d) => d.value === weekday)?.label ?? "";

  const current = today.find(
    (b) => b.start_time && b.start_time <= now && (b.end_time ? now < b.end_time : false)
  );
  const next = today.find((b) => b.start_time && b.start_time > now);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rotina de hoje · {dayLabel}</CardTitle>
        <CalendarRange className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        {today.length === 0 ? (
          <p className="py-3 text-center text-sm text-muted-foreground">
            Sem rotina para hoje. Cadastre em <span className="text-primary">Rotina</span>.
          </p>
        ) : (
          <>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-xs uppercase tracking-wide text-primary">Agora</p>
              {current ? (
                <>
                  <p className="mt-1 font-medium">{current.title}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {current.start_time}
                    {current.end_time ? `–${current.end_time}` : ""} ·{" "}
                    {pillarLabel(current.category)}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  Janela livre — escolha uma prioridade.
                </p>
              )}
            </div>

            {next && (
              <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-secondary/30 p-3 text-sm">
                <ArrowRight className="h-4 w-4 text-accent" />
                <span className="font-medium">{next.start_time}</span>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">
                  {next.title}
                </span>
                <Badge className={PILLARS[next.category]?.color} variant="outline">
                  {pillarLabel(next.category)}
                </Badge>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
