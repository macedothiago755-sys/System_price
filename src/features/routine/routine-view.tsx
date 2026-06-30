"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Trash2, Wand2, Clock } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WEEKDAYS, PILLARS, pillarLabel } from "@/lib/routine";
import type { RoutineBlock } from "@/lib/types";
import {
  addRoutineBlock,
  deleteRoutineBlock,
  seedBaseRoutine,
  clearRoutine,
} from "./actions";

const todayIso = (() => {
  const d = new Date().getDay(); // 0=Dom..6=Sáb
  return d === 0 ? 7 : d; // → 1=Seg..7=Dom
})();

export function RoutineView({ blocks }: { blocks: RoutineBlock[] }) {
  const router = useRouter();

  // manual add
  const [weekday, setWeekday] = useState(todayIso);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("trabalho");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await addRoutineBlock({
      weekday,
      start_time: start,
      end_time: end,
      title,
      category,
      notes: "",
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "Erro ao salvar.");
      return;
    }
    setTitle("");
    setStart("");
    setEnd("");
    router.refresh();
  }

  async function loadBase() {
    if (blocks.length && !confirm("Isso substitui a rotina atual pela rotina base. Continuar?"))
      return;
    setBusy("seed");
    setError(null);
    const res = await seedBaseRoutine();
    setBusy(null);
    if (!res.ok) {
      setError(res.error ?? "Erro ao carregar a rotina.");
      return;
    }
    router.refresh();
  }

  async function wipe() {
    if (!confirm("Apagar toda a rotina?")) return;
    setBusy("clear");
    await clearRoutine();
    setBusy(null);
    router.refresh();
  }

  async function remove(id: string) {
    await deleteRoutineBlock(id);
    router.refresh();
  }

  const byDay = (wd: number) =>
    blocks
      .filter((b) => b.weekday === wd)
      .sort((a, b) => (a.start_time ?? "").localeCompare(b.start_time ?? ""));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardTitle className="mb-3">Adicionar atividade</CardTitle>
          <form onSubmit={add} className="space-y-3">
            <select
              value={weekday}
              onChange={(e) => setWeekday(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              {WEEKDAYS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Treino, Polar, MBA Ecommerce"
              className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Início</label>
                <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Fim (opcional)</label>
                <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              {Object.entries(PILLARS).map(([v, p]) => (
                <option key={v} value={v}>
                  {p.label}
                </option>
              ))}
            </select>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Adicionar
            </Button>
            {error && (
              <p className="rounded-lg border border-destructive/20 bg-destructive/10 p-2 text-xs text-destructive">
                {error.includes("routine_blocks")
                  ? "A tabela da rotina não existe ainda. Rode a migration 0005 no Supabase (veja docs/SETUP.md)."
                  : error}
              </p>
            )}
          </form>

          <div className="mt-4 space-y-2 border-t border-border/60 pt-4">
            <Button onClick={loadBase} variant="accent" className="w-full" disabled={busy !== null}>
              {busy === "seed" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              Carregar minha rotina base
            </Button>
            <p className="text-xs text-muted-foreground">
              Preenche toda a semana com sua rotina (Seg–Dom). Sem IA.
            </p>
            {blocks.length > 0 && (
              <button onClick={wipe} className="text-xs text-muted-foreground hover:text-destructive">
                Apagar rotina
              </button>
            )}
          </div>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          {WEEKDAYS.map((d) => {
            const items = byDay(d.value);
            const isToday = d.value === todayIso;
            return (
              <Card key={d.value} className={isToday ? "border-primary/40" : ""}>
                <div className="mb-3 flex items-center gap-2">
                  <CardTitle className="text-foreground">{d.label}</CardTitle>
                  {isToday && <Badge variant="primary">Hoje</Badge>}
                </div>
                {items.length === 0 ? (
                  <p className="py-3 text-center text-xs text-muted-foreground">
                    Dia livre.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {items.map((b) => (
                      <div key={b.id} className="group flex items-start gap-3 rounded-lg border border-border/50 bg-secondary/30 p-3">
                        <span className="flex w-24 shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {b.start_time ?? "—"}
                          {b.end_time ? `–${b.end_time}` : ""}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm">{b.title}</p>
                          {b.notes && (
                            <p className="mt-0.5 text-xs text-muted-foreground">{b.notes}</p>
                          )}
                          <span className={`mt-1 inline-block text-xs ${PILLARS[b.category]?.color ?? "text-muted-foreground"}`}>
                            {pillarLabel(b.category)}
                          </span>
                        </div>
                        <button onClick={() => remove(b.id)} title="Excluir" className="shrink-0 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
