"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logHealth } from "./actions";

const fields = [
  { key: "sleep_duration", label: "Sono (h)", step: "0.1", def: "7.5" },
  { key: "sleep_score", label: "Score de sono", step: "1", def: "80" },
  { key: "recovery_score", label: "Recuperação (%)", step: "1", def: "75" },
  { key: "steps", label: "Passos", step: "1", def: "8000" },
] as const;

export function HealthLogForm() {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.key, f.def]))
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await logHealth({
      sleep_duration: Number(values.sleep_duration),
      sleep_score: Number(values.sleep_score),
      recovery_score: Number(values.recovery_score),
      steps: Number(values.steps),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <Card>
      <h2 className="mb-1 text-sm font-medium">Registro manual</h2>
      <p className="mb-3 text-xs text-muted-foreground">
        Enquanto a integração Polar Flow não chega, registre seus dados de hoje.
      </p>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="mb-1 block text-xs text-muted-foreground">
              {f.label}
            </label>
            <input
              type="number"
              step={f.step}
              value={values[f.key]}
              onChange={(e) =>
                setValues((v) => ({ ...v, [f.key]: e.target.value }))
              }
              className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        ))}
        <Button type="submit" className="col-span-2" disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Salvar dados de hoje
        </Button>
      </form>
    </Card>
  );
}
