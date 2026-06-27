"use client";

import {
  Moon,
  HeartPulse,
  Activity,
  Footprints,
  Flame,
  Watch,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScoreRing } from "@/components/ui/score-ring";
import { Badge } from "@/components/ui/badge";
import { performanceScore } from "@/lib/utils";
import type { HealthMetric } from "@/lib/types";

export function HealthDashboard({
  latest,
  history,
}: {
  latest: HealthMetric | null;
  history: HealthMetric[];
}) {
  const score = performanceScore({
    sleep_score: latest?.sleep_score,
    recovery_score: latest?.recovery_score,
  });

  const metrics = [
    { label: "Sono", value: latest?.sleep_duration != null ? `${latest.sleep_duration}h` : "—", icon: Moon, color: "text-sky-400" },
    { label: "Recuperação", value: latest?.recovery_score != null ? `${latest.recovery_score}%` : "—", icon: HeartPulse, color: "text-rose-400" },
    { label: "HRV", value: latest?.hrv != null ? `${latest.hrv}ms` : "—", icon: Activity, color: "text-primary" },
    { label: "FC repouso", value: latest?.heart_rate != null ? `${latest.heart_rate}` : "—", icon: HeartPulse, color: "text-accent" },
    { label: "Passos", value: latest?.steps != null ? latest.steps.toLocaleString("pt-BR") : "—", icon: Footprints, color: "text-emerald-400" },
    { label: "Calorias", value: latest?.calories != null ? latest.calories.toLocaleString("pt-BR") : "—", icon: Flame, color: "text-amber-400" },
  ];

  const chartData = history.map((h) => ({
    date: h.date.slice(5),
    sono: h.sleep_duration,
    recuperação: h.recovery_score,
  }));

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <Card className="flex flex-col items-center justify-center text-center">
        <CardTitle className="mb-4">Performance Score</CardTitle>
        <ScoreRing value={score} label="/ 100" />
        <p className="mt-4 text-sm text-muted-foreground">
          Combina sono, recuperação, foco e energia em um único número.
        </p>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Métricas de hoje</CardTitle>
          <Badge variant="outline">
            <Watch className="h-3 w-3" /> Polar Flow (em breve)
          </Badge>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-border/50 bg-secondary/40 p-3"
            >
              <m.icon className={`mb-2 h-5 w-5 ${m.color}`} />
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-lg font-semibold">{m.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardTitle className="mb-4">Sono x Recuperação (14 dias)</CardTitle>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="sono" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(199 89% 60%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(199 89% 60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="rec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(152 60% 50%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(152 60% 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="hsl(220 9% 60%)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(220 9% 60%)" fontSize={11} tickLine={false} axisLine={false} width={28} />
              <Tooltip
                contentStyle={{
                  background: "hsl(224 13% 9%)",
                  border: "1px solid hsl(224 12% 16%)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="sono" stroke="hsl(199 89% 60%)" fill="url(#sono)" strokeWidth={2} />
              <Area type="monotone" dataKey="recuperação" stroke="hsl(152 60% 50%)" fill="url(#rec)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
