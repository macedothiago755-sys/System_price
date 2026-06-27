"use client";

import { motion } from "framer-motion";
import { Clock, Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Priority } from "@/lib/data";

const energyLabel = { low: "Baixa", medium: "Média", high: "Alta" } as const;
const energyVariant = {
  low: "default",
  medium: "warning",
  high: "accent",
} as const;

export function PrioritiesCard({ priorities }: { priorities: Priority[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Prioridades do dia</CardTitle>
        <Badge variant="outline">Top 3</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {priorities.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Sem prioridades abertas. Faça seu planejamento. ✨
          </p>
        )}
        {priorities.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl border border-border/50 bg-secondary/30 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.reason}
                  </p>
                </div>
              </div>
              <Badge variant={energyVariant[p.energy]}>
                <Zap className="h-3 w-3" />
                {energyLabel[p.energy]}
              </Badge>
            </div>
            <div className="mt-2 flex items-center gap-1 pl-9 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {p.estimated_min ? `~${p.estimated_min} min` : "sem estimativa"}
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
