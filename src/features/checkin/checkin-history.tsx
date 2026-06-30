import { Card, CardTitle } from "@/components/ui/card";
import { Battery, Brain, Moon } from "lucide-react";
import type { DailyCheckin } from "@/lib/types";

const moodEmoji: Record<string, string> = { great: "😀", ok: "😐", bad: "😞" };

function dayLabel(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(date + "T00:00:00"));
}

export function CheckinHistory({ history }: { history: DailyCheckin[] }) {
  if (history.length === 0) return null;

  return (
    <Card className="mt-5">
      <CardTitle className="mb-3">Histórico de check-ins</CardTitle>
      <div className="space-y-2">
        {history.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/30 p-3 text-sm"
          >
            <span className="w-24 shrink-0 capitalize text-muted-foreground">
              {dayLabel(c.date)}
            </span>
            <span className="text-lg">{c.mood ? moodEmoji[c.mood] : "—"}</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Battery className="h-3.5 w-3.5 text-primary" /> {c.energy ?? "—"}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Brain className="h-3.5 w-3.5 text-accent" /> {c.focus ?? "—"}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Moon className="h-3.5 w-3.5 text-sky-400" />{" "}
              {c.sleep_hours != null ? `${c.sleep_hours}h` : "—"}
            </span>
            {c.win_of_day && (
              <span className="ml-auto hidden min-w-0 truncate text-xs text-muted-foreground sm:block">
                🏆 {c.win_of_day}
              </span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
