"use client";

import { motion } from "framer-motion";
import { Battery, Brain, Moon, HeartPulse } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockCheckin, mockHealth } from "@/lib/mock-data";

const metrics = [
  {
    label: "Energia",
    value: `${mockCheckin.energy}/10`,
    icon: Battery,
    color: "text-primary",
  },
  { label: "Foco", value: "Alto", icon: Brain, color: "text-accent" },
  {
    label: "Sono",
    value: `${mockCheckin.sleep_hours}h`,
    icon: Moon,
    color: "text-sky-400",
  },
  {
    label: "Recuperação",
    value: `${mockHealth.recovery_score}%`,
    icon: HeartPulse,
    color: "text-rose-400",
  },
];

export function StateCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado atual</CardTitle>
        <Badge variant="primary">Performance estimada · 86</Badge>
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
            <span className="font-medium text-primary">Recomendação da IA: </span>
            Hoje é um bom dia para tarefas estratégicas. Aproveite o pico de
            foco da manhã antes da reunião das 14h.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
