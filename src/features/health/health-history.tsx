import { Card, CardTitle } from "@/components/ui/card";
import { Moon, HeartPulse, Footprints } from "lucide-react";
import type { HealthMetric } from "@/lib/types";

function dayLabel(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(date + "T00:00:00"));
}

export function HealthHistory({ history }: { history: HealthMetric[] }) {
  const rows = [...history].reverse(); // mais recentes primeiro
  if (rows.length === 0) return null;

  return (
    <Card className="mt-5">
      <CardTitle className="mb-3">Dias registrados</CardTitle>
      <div className="space-y-2">
        {rows.map((h) => (
          <div
            key={h.date}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-border/50 bg-secondary/30 p-3 text-sm"
          >
            <span className="w-24 shrink-0 capitalize text-muted-foreground">
              {dayLabel(h.date)}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Moon className="h-3.5 w-3.5 text-sky-400" />
              {h.sleep_duration != null ? `${h.sleep_duration}h` : "—"}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <HeartPulse className="h-3.5 w-3.5 text-rose-400" />
              {h.recovery_score != null ? `${h.recovery_score}%` : "—"}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Footprints className="h-3.5 w-3.5 text-emerald-400" />
              {h.steps != null ? h.steps.toLocaleString("pt-BR") : "—"}
            </span>
            {h.workout_sport && (
              <span className="ml-auto text-xs text-violet-400">
                🏋️ {h.workout_sport}
                {h.workout_minutes ? ` · ${h.workout_minutes}min` : ""}
              </span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
