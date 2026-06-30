"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { GoalCategory } from "@/lib/types";
import { createGoal } from "./actions";

const categories: { value: GoalCategory; label: string }[] = [
  { value: "finance", label: "Financeiro" },
  { value: "health", label: "Saúde" },
  { value: "career", label: "Carreira" },
  { value: "relationship", label: "Relacionamento" },
  { value: "learning", label: "Aprendizado" },
];

export function GoalForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<GoalCategory>("career");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await createGoal({
      title,
      category,
      target_value: Number(target),
      current_value: 0,
      unit,
      deadline: null,
    });
    setSaving(false);
    setTitle("");
    setTarget("");
    setUnit("");
    router.refresh();
  }

  return (
    <Card>
      <h2 className="mb-3 text-sm font-medium">Nova meta</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Reserva de emergência"
          className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as GoalCategory)}
          className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Meta (valor)"
            className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="Unidade (R$, km…)"
            className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Criar meta
        </Button>
      </form>
    </Card>
  );
}
