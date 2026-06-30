"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, HeartPulse, Briefcase, Users, GraduationCap, Plus, Minus, Trash2 } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { Goal, GoalCategory } from "@/lib/types";
import { updateGoalProgress, deleteGoal } from "./actions";

const catMeta: Record<GoalCategory, { label: string; icon: typeof Wallet; color: string }> = {
  finance: { label: "Financeiro", icon: Wallet, color: "text-primary" },
  health: { label: "Saúde", icon: HeartPulse, color: "text-rose-400" },
  career: { label: "Carreira", icon: Briefcase, color: "text-accent" },
  relationship: { label: "Relacionamento", icon: Users, color: "text-sky-400" },
  learning: { label: "Aprendizado", icon: GraduationCap, color: "text-amber-400" },
};

function pct(g: Goal) {
  if (!g.target_value) return 0;
  return Math.min(100, Math.round(((g.current_value ?? 0) / g.target_value) * 100));
}

export function GoalsBoard({ goals }: { goals: Goal[] }) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState<Record<string, number>>({});

  async function nudge(g: Goal, dir: 1 | -1) {
    const step = g.target_value ? Math.max(1, Math.round(g.target_value * 0.05)) : 1;
    const base = optimistic[g.id] ?? g.current_value ?? 0;
    const next = Math.max(0, base + dir * step);
    setOptimistic((o) => ({ ...o, [g.id]: next }));
    await updateGoalProgress(g.id, next);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Excluir esta meta?")) return;
    await deleteGoal(id);
    router.refresh();
  }

  if (goals.length === 0) {
    return (
      <Card>
        <p className="py-8 text-center text-sm text-muted-foreground">
          Defina sua primeira meta para começar a acompanhar.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {goals.map((g) => {
        const meta = catMeta[g.category];
        const Icon = meta.icon;
        const current = optimistic[g.id] ?? g.current_value ?? 0;
        const display = { ...g, current_value: current };
        return (
          <Card key={g.id}>
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${meta.color}`} />
                <Badge variant="outline">{meta.label}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{pct(display)}%</span>
                <button
                  onClick={() => remove(g.id)}
                  title="Excluir meta"
                  className="text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <CardTitle className="mb-2 normal-case tracking-normal text-foreground">
              {g.title}
            </CardTitle>
            <Progress value={pct(display)} />
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {current}
                {g.unit ? ` ${g.unit}` : ""} / {g.target_value ?? "—"}
                {g.unit ? ` ${g.unit}` : ""}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => nudge(g, -1)}
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-border hover:bg-secondary"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <button
                  onClick={() => nudge(g, 1)}
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-border hover:bg-secondary"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
