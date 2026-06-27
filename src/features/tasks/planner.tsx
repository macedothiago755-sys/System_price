"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PlannedTask } from "@/lib/ai/planner";
import { savePlannedTasks } from "./actions";

const priorityVariant = {
  urgent: "destructive",
  high: "accent",
  medium: "warning",
  low: "default",
} as const;

export function Planner() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<PlannedTask[] | null>(null);

  async function handlePlan() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brainDump: text }),
      });
      const data = await res.json();
      setResult(data.tasks ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!result?.length) return;
    setSaving(true);
    await savePlannedTasks(result);
    setSaving(false);
    setResult(null);
    setText("");
    router.refresh();
  }

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-accent" />
        <h2 className="text-sm font-medium">Planejamento inteligente</h2>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">
        Jogue tudo que precisa fazer. A IA prioriza e organiza por categoria e
        energia.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder={"criar campanha\nestudar IA\npagar conta\nresponder cliente"}
        className="w-full resize-none rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
      />
      <Button
        onClick={handlePlan}
        disabled={loading || !text.trim()}
        variant="accent"
        className="mt-3"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        Organizar com IA
      </Button>

      {result && (
        <div className="mt-4 space-y-2">
          {result.map((t, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-secondary/30 p-3"
            >
              <span className="text-sm">{t.title}</span>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant={priorityVariant[t.priority]}>
                  {t.priority}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  ~{t.estimated_min}min
                </span>
              </div>
            </div>
          ))}

          <Button
            onClick={handleSave}
            disabled={saving}
            className="mt-1 w-full"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Adicionar {result.length} tarefa{result.length > 1 ? "s" : ""} ao board
          </Button>
        </div>
      )}
    </Card>
  );
}
