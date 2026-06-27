"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Clock, Zap, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";
import { toggleTask } from "./actions";

const categoryColor: Record<Task["category"], string> = {
  work: "text-accent",
  personal: "text-sky-400",
  health: "text-rose-400",
  finance: "text-primary",
  learning: "text-amber-400",
};

const energyLabel = { low: "Baixa", medium: "Média", high: "Alta" } as const;

export function TaskBoard({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);

  function toggle(id: string) {
    let nowDone = false;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        nowDone = t.status !== "done";
        return { ...t, status: nowDone ? "done" : "todo" };
      })
    );
    // Persist in the background (optimistic UI). No-op in demo mode.
    void toggleTask(id, nowDone);
  }

  const active = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="mb-3 text-sm font-medium">A fazer ({active.length})</h2>
        <div className="space-y-2">
          {active.map((t) => (
            <TaskRow key={t.id} task={t} onToggle={toggle} />
          ))}
          {active.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Tudo concluído. 🎉
            </p>
          )}
        </div>
      </Card>

      {done.length > 0 && (
        <Card>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            Concluídas ({done.length})
          </h2>
          <div className="space-y-2">
            {done.map((t) => (
              <TaskRow key={t.id} task={t} onToggle={toggle} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
}: {
  task: Task;
  onToggle: (id: string) => void;
}) {
  const done = task.status === "done";
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/30 p-3 transition-opacity",
        done && "opacity-50"
      )}
    >
      <button onClick={() => onToggle(task.id)} className="shrink-0">
        {done ? (
          <CheckCircle2 className="h-5 w-5 text-primary" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-medium", done && "line-through")}>
          {task.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className={cn("font-medium", categoryColor[task.category])}>
            {task.category}
          </span>
          {task.estimated_min && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {task.estimated_min}min
            </span>
          )}
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {energyLabel[task.energy_required]}
          </span>
          {task.blocker && (
            <span className="flex items-center gap-1 text-warning">
              <AlertCircle className="h-3 w-3" />
              Travado
            </span>
          )}
        </div>
      </div>

      {task.priority === "urgent" && (
        <Badge variant="destructive">urgente</Badge>
      )}
    </div>
  );
}
