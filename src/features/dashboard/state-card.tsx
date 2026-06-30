"use client";

import { motion } from "framer-motion";
import { Battery, Brain, Moon, HeartPulse } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { performanceScore } from "@/lib/utils";
import type { DailyCheckin, HealthMetric } from "@/lib/types";

function focusLabel(focus: number | null | undefined): string {
  if (focus == null) return "—";
  if (focus >= 8) return "Alto";
  if (focus >= 5) return "Médio";
  return "Baixo";
}

export function StateCard({
  checkin,
  health,
}: {
  checkin: DailyCheckin | null;
  health: HealthMetric | null;
}) {
  const score = performanceScore({
    sleep_score: health?.sleep_score,
    recovery_score: health?.recovery_score,
    focus: checkin?.focus,
    energy: checkin?.energy,
  });

  const metrics = [
    {
      label: "Energia",
      value: checkin?.energy != null ? `${checkin.energy}/10` : "—",
      icon: Battery,
      color: "text-primary",
    },
    {
      label: "Foco",
      value: focusLabel(checkin?.focus),
      icon: Brain,
      color: "text-accent",
    },
    {
      label: "Sono",
      value: checkin?.sleep_hours != null ? `${checkin.sleep_hours}h` : "—",
      icon: Moon,
      color: "text-sky-400",
    },
    {
      label: "Recuperação",
      value: health?.recovery_score != null ? `${health.recovery_score}%` : "—",
      icon: HeartPulse,
      color: "text-rose-400",
    },
  ];

  const recommendation =
    score >= 80
      ? "Hoje é um bom dia para tarefas estratégicas. Aproveite o pico de foco antes da tarde."
      : score >= 60
        ? "Energia razoável. Comece pelas prioridades e faça pausas curtas."
        : "Dia de baixa. Foque no essencial e em tarefas leves — recupere-se.";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado atual</CardTitle>
        <Badge variant="primary">Performance estimada · {score}</Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl border border-border/50 bg-secondary/40 p-3"
            >
              <m.icon className={`mb-2 h-5 w-5 ${m.color}`} />
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-lg font-semibold">{m.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm">
            <span className="font-medium text-primary">
              Recomendação da IA:{" "}
            </span>
            {recommendation}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
