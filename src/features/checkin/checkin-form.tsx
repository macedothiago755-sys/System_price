"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Mood, DailyCheckin } from "@/lib/types";
import { submitCheckin } from "./actions";

const moods: { value: Mood; emoji: string; label: string }[] = [
  { value: "great", emoji: "😀", label: "Bem" },
  { value: "ok", emoji: "😐", label: "Neutro" },
  { value: "bad", emoji: "😞", label: "Mal" },
];

function Scale({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={cn(
            "h-10 w-10 rounded-lg border text-sm font-medium transition-all",
            value === n
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-secondary/40 hover:border-primary/50"
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

export function CheckinForm({
  initial,
}: {
  initial?: DailyCheckin | null;
}) {
  const [energy, setEnergy] = useState(initial?.energy ?? 7);
  const [focus, setFocus] = useState(initial?.focus ?? 7);
  const [mood, setMood] = useState<Mood>(initial?.mood ?? "great");
  const [sleep, setSleep] = useState(String(initial?.sleep_hours ?? "7.5"));
  const [concern, setConcern] = useState(initial?.main_concern ?? "");
  const [win, setWin] = useState(initial?.win_of_day ?? "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const alreadyToday = Boolean(initial);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await submitCheckin({
      energy,
      focus,
      mood,
      sleep_hours: Number(sleep),
      main_concern: concern,
      win_of_day: win,
    });
    setSaving(false);
    if (res.ok) setSaved(true);
    else setError(res.error);
  }

  if (saved) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="text-center">
          <div className="py-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-2xl">
              ✅
            </div>
            <h2 className="text-xl font-semibold">Check-in registrado!</h2>
            <p className="mt-1 text-muted-foreground">
              +25 XP · Sequência mantida 🔥
            </p>
            <Button className="mt-6" onClick={() => setSaved(false)}>
              Editar respostas
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {alreadyToday && (
        <p className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm text-primary">
          ✅ Você já fez o check-in de hoje. Os dados estão salvos — pode editar e
          salvar de novo se quiser.
        </p>
      )}
      <Card>
        <label className="mb-3 block text-sm font-medium">
          Como está sua energia?
        </label>
        <Scale value={energy} onChange={setEnergy} />
      </Card>

      <Card>
        <label className="mb-3 block text-sm font-medium">
          Qual seu nível de foco?
        </label>
        <Scale value={focus} onChange={setFocus} />
      </Card>

      <Card>
        <label className="mb-3 block text-sm font-medium">
          Como está seu humor?
        </label>
        <div className="flex gap-3">
          {moods.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMood(m.value)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-xl border p-4 transition-all",
                mood === m.value
                  ? "border-primary bg-primary/10"
                  : "border-border bg-secondary/40 hover:border-primary/50"
              )}
            >
              <span className="text-3xl">{m.emoji}</span>
              <span className="text-xs text-muted-foreground">{m.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <label className="mb-3 block text-sm font-medium">
          Quantas horas você dormiu?
        </label>
        <input
          type="number"
          step="0.5"
          value={sleep}
          onChange={(e) => setSleep(e.target.value)}
          className="w-32 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-lg focus:border-primary focus:outline-none"
        />
      </Card>

      <Card>
        <label className="mb-2 block text-sm font-medium">
          Principal preocupação hoje
        </label>
        <textarea
          value={concern}
          onChange={(e) => setConcern(e.target.value)}
          rows={2}
          placeholder="O que está ocupando sua mente?"
          className="w-full resize-none rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </Card>

      <Card>
        <label className="mb-2 block text-sm font-medium">
          Qual vitória faria hoje valer a pena?
        </label>
        <textarea
          value={win}
          onChange={(e) => setWin(e.target.value)}
          rows={2}
          placeholder="Defina sua vitória do dia"
          className="w-full resize-none rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </Card>

      {error && (
        <p className="text-center text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Concluir check-in · +25 XP
      </Button>
    </form>
  );
}
