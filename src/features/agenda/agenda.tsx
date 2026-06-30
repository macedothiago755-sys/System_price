"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Video, Focus, CalendarDays, Trash2 } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CalendarEvent } from "@/lib/types";
import { createEvent, deleteEvent } from "./actions";

const kinds = [
  { value: "meeting", label: "Reunião", icon: Video, color: "text-accent" },
  { value: "focus_block", label: "Bloco de foco", icon: Focus, color: "text-primary" },
  { value: "appointment", label: "Compromisso", icon: CalendarDays, color: "text-sky-400" },
];

const kindMeta = (k: string) => kinds.find((x) => x.value === k) ?? kinds[2];

function dayLabel(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date(iso));
}
function timeLabel(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function Agenda({ events }: { events: CalendarEvent[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("meeting");
  const [datetime, setDatetime] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await createEvent({
      title,
      kind,
      starts_at: new Date(datetime).toISOString(),
      ends_at: null,
    });
    setSaving(false);
    if (!res.ok) return setError(res.error ?? "Erro ao salvar.");
    setTitle("");
    setDatetime("");
    router.refresh();
  }

  async function remove(id: string) {
    await deleteEvent(id);
    router.refresh();
  }

  // Group events by calendar day.
  const groups = new Map<string, CalendarEvent[]>();
  for (const ev of events) {
    const key = ev.starts_at.slice(0, 10);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(ev);
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardTitle className="mb-3">Novo evento</CardTitle>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Reunião com cliente"
            className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            {kinds.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Data e hora
            </label>
            <input
              type="datetime-local"
              required
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Adicionar
          </Button>
        </form>

        <p className="mt-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
          🔌 A sincronização automática com o Google Calendar entra na Fase 4.
          Por enquanto, gerencie seus eventos aqui.
        </p>
      </Card>

      <Card className="lg:col-span-2">
        <CardTitle className="mb-3">Próximos eventos</CardTitle>
        {events.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum evento agendado. Adicione o primeiro ao lado.
          </p>
        ) : (
          <div className="space-y-5">
            {[...groups.entries()].map(([day, evs]) => (
              <div key={day}>
                <p className="mb-2 text-xs font-medium uppercase capitalize tracking-wide text-muted-foreground">
                  {dayLabel(day)}
                </p>
                <div className="space-y-2">
                  {evs.map((ev) => {
                    const m = kindMeta(ev.kind);
                    const Icon = m.icon;
                    return (
                      <div
                        key={ev.id}
                        className="flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/30 p-3"
                      >
                        <span className="w-12 shrink-0 text-sm font-medium text-muted-foreground">
                          {timeLabel(ev.starts_at)}
                        </span>
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary ${m.color}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm">
                          {ev.title}
                        </span>
                        <Badge variant="outline">{m.label}</Badge>
                        <button
                          onClick={() => remove(ev.id)}
                          title="Excluir"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
