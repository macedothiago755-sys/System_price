"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Clock, Zap, AlertCircle, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";
import { toggleTask, deleteTask, clearAllTasks } from "./actions";

const categoryColor: Record<Task["category"], string> = {
  work: "text-accent",
  personal: "text-sky-400",
  health: "text-rose-400",
  finance: "text-primary",
  learning: "text-amber-400",
};

const energyLabel = { low: "Baixa", medium: "Média", high: "Alta" } as const;

export function TaskBoard({ initialTasks }: { initialTasks: Task[] }) {
  const router = useRouter();
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
    void toggleTask(id, nowDone);
  }

  function remove(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    void deleteTask(id);
  }

  async function clearAll() {
    if (!confirm("Apagar TODAS as tarefas do board? Isso não pode ser desfeito."))
      return;
    setTasks([]);
    await clearAllTasks();
    router.refresh();
  }

  const active = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium">A fazer ({active.length})</h2>
          {tasks.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Limpar tudo
            </button>
          )}
        </div>
        <div className="space-y-2">
          {active.map((t) => (
            <TaskRow key={t.id} task={t} onToggle={toggle} onDelete={remove} />
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
              <TaskRow key={t.id} task={t} onToggle={toggle} onDelete={remove} />
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
  onDelete,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const done = task.status === "done";
  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/30 p-3 transition-opacity",
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

      <button
        onClick={() => onDelete(task.id)}
        title="Excluir tarefa"
        className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
