"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logHealth } from "./actions";

// Mirrors the data your Polar watch reports. Leave blank what you don't have.
const fields = [
  { key: "sleep_duration", label: "Sono (h)", step: "0.1", placeholder: "7.5" },
  { key: "sleep_score", label: "Score de sono", step: "1", placeholder: "80" },
  { key: "recovery_score", label: "Recuperação (%)", step: "1", placeholder: "75" },
  { key: "hrv", label: "HRV (ms)", step: "1", placeholder: "65" },
  { key: "heart_rate", label: "FC repouso (bpm)", step: "1", placeholder: "58" },
  { key: "training_load", label: "Carga de treino", step: "1", placeholder: "120" },
  { key: "steps", label: "Passos", step: "1", placeholder: "8000" },
  { key: "calories", label: "Calorias", step: "1", placeholder: "2200" },
] as const;

const num = (v: string) => (v === "" ? null : Number(v));

export function HealthLogForm() {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await logHealth({
      date,
      sleep_duration: num(values.sleep_duration ?? ""),
      sleep_score: num(values.sleep_score ?? ""),
      recovery_score: num(values.recovery_score ?? ""),
      hrv: num(values.hrv ?? ""),
      heart_rate: num(values.heart_rate ?? ""),
      training_load: num(values.training_load ?? ""),
      steps: num(values.steps ?? ""),
      calories: num(values.calories ?? ""),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <Card>
      <h2 className="mb-1 text-sm font-medium">Registro do relógio (Polar)</h2>
      <p className="mb-3 text-xs text-muted-foreground">
        Preencha com os dados que o relógio mostra. Deixe em branco o que não tiver.
        Salvar de novo no mesmo dia atualiza os valores.
      </p>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="mb-1 block text-xs text-muted-foreground">Data</label>
          <input
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        {fields.map((f) => (
          <div key={f.key}>
            <label className="mb-1 block text-xs text-muted-foreground">
              {f.label}
            </label>
            <input
              type="number"
              step={f.step}
              placeholder={f.placeholder}
              value={values[f.key] ?? ""}
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
          {saved ? "Salvo! Atualizar" : "Salvar dados"}
        </Button>
      </form>
    </Card>
  );
}
