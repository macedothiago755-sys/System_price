"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logHealth } from "./actions";

// Numeric fields, grouped by theme. Leave blank what your watch doesn't show.
const groups: {
  title: string;
  fields: { key: string; label: string; step: string; placeholder: string }[];
}[] = [
  {
    title: "Sono & Recuperação",
    fields: [
      { key: "sleep_duration", label: "Sono (h)", step: "0.1", placeholder: "7.5" },
      { key: "sleep_score", label: "Score de sono", step: "1", placeholder: "80" },
      { key: "recovery_score", label: "Recuperação (%)", step: "1", placeholder: "75" },
      { key: "hrv", label: "HRV (ms)", step: "1", placeholder: "65" },
      { key: "heart_rate", label: "FC repouso (bpm)", step: "1", placeholder: "58" },
    ],
  },
  {
    title: "Cardio Load (esforço × tolerância)",
    fields: [
      { key: "strain", label: "Esforço (strain)", step: "0.1", placeholder: "120" },
      { key: "tolerance", label: "Tolerância", step: "0.1", placeholder: "110" },
      { key: "training_load", label: "Carga de treino", step: "1", placeholder: "120" },
    ],
  },
  {
    title: "Atividade",
    fields: [
      { key: "steps", label: "Passos", step: "1", placeholder: "8000" },
      { key: "calories", label: "Calorias", step: "1", placeholder: "2200" },
      { key: "workout_minutes", label: "Tempo de treino (min)", step: "1", placeholder: "60" },
    ],
  },
];

const cardioStatuses = [
  "Destreinando",
  "Mantendo",
  "Produtivo",
  "Sobrecarga",
  "Tensionado",
];

const num = (v: string | undefined) => (!v ? null : Number(v));
const txt = (v: string | undefined) => (!v ? null : v);

export function HealthLogForm() {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: string, v: string) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    const res = await logHealth({
      date,
      sleep_duration: num(values.sleep_duration),
      sleep_score: num(values.sleep_score),
      recovery_score: num(values.recovery_score),
      hrv: num(values.hrv),
      heart_rate: num(values.heart_rate),
      training_load: num(values.training_load),
      steps: num(values.steps),
      calories: num(values.calories),
      strain: num(values.strain),
      tolerance: num(values.tolerance),
      cardio_status: txt(values.cardio_status),
      workout_sport: txt(values.workout_sport),
      workout_minutes: num(values.workout_minutes),
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "Erro ao salvar.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  const inputCls =
    "w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none";

  return (
    <Card>
      <h2 className="mb-1 text-sm font-medium">Registro do relógio (Polar)</h2>
      <p className="mb-4 text-xs text-muted-foreground">
        Preencha com o que o relógio mostra. Deixe em branco o que não tiver.
        Salvar de novo no mesmo dia atualiza os valores.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Data</label>
          <input
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            className={inputCls}
          />
        </div>

        {groups.map((g) => (
          <div key={g.title}>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {g.title}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {g.fields.map((f) => (
                <div key={f.key}>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    {f.label}
                  </label>
                  <input
                    type="number"
                    step={f.step}
                    placeholder={f.placeholder}
                    value={values[f.key] ?? ""}
                    onChange={(e) => set(f.key, e.target.value)}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Status & Treino
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Status cardiovascular
              </label>
              <select
                value={values.cardio_status ?? ""}
                onChange={(e) => set("cardio_status", e.target.value)}
                className={inputCls}
              >
                <option value="">—</option>
                {cardioStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-2">
              <label className="mb-1 block text-xs text-muted-foreground">
                Modalidade do treino
              </label>
              <input
                type="text"
                placeholder="Ex: Corrida, Musculação, Ciclismo"
                value={values.workout_sport ?? ""}
                onChange={(e) => set("workout_sport", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {saved ? "Salvo! Atualizar" : "Salvar dados"}
        </Button>
        {error && (
          <p className="rounded-lg border border-destructive/20 bg-destructive/10 p-2 text-xs text-destructive">
            {/cardio_status|strain|tolerance|workout/.test(error)
              ? "Faltam colunas no banco. Rode a migration 0004 no Supabase (veja docs/SETUP.md)."
              : error}
          </p>
        )}
      </form>
    </Card>
  );
}
