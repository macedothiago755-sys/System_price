"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, CalendarClock } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/types";
import { createProject } from "./actions";

const statusVariant: Record<string, "primary" | "warning" | "default"> = {
  active: "primary",
  paused: "warning",
  done: "default",
};
const statusLabel: Record<string, string> = {
  active: "Ativo",
  paused: "Pausado",
  done: "Concluído",
};

export function ProjectsList({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [objective, setObjective] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await createProject({ name, objective, deadline: null });
    setSaving(false);
    setName("");
    setObjective("");
    router.refresh();
  }

  return (
    <Card>
      <CardTitle className="mb-3">Projetos</CardTitle>

      <div className="mb-4 space-y-2">
        {projects.map((p) => (
          <div
            key={p.id}
            className="rounded-lg border border-border/50 bg-secondary/30 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">{p.name}</p>
              <Badge variant={statusVariant[p.status] ?? "default"}>
                {statusLabel[p.status] ?? p.status}
              </Badge>
            </div>
            {p.objective && (
              <p className="mt-1 text-xs text-muted-foreground">{p.objective}</p>
            )}
            {p.deadline && (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarClock className="h-3 w-3" />
                {new Date(p.deadline).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>
        ))}
        {projects.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Nenhum projeto ainda.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2 border-t border-border/60 pt-3">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do projeto"
          className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <input
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          placeholder="Objetivo (opcional)"
          className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Novo projeto
        </Button>
      </form>
    </Card>
  );
}
