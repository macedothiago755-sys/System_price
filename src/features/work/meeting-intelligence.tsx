"use client";

import { useState } from "react";
import { Sparkles, Loader2, Check, CircleCheck, ListChecks } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MeetingAnalysis } from "@/lib/ai/meeting";
import { saveMeeting } from "./actions";

export function MeetingIntelligence() {
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [result, setResult] = useState<MeetingAnalysis | null>(null);

  async function analyze() {
    setLoading(true);
    setResult(null);
    setSaved(false);
    try {
      const res = await fetch("/api/ai/meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw }),
      });
      setResult(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!result) return;
    setSaving(true);
    await saveMeeting(result, raw);
    setSaving(false);
    setSaved(true);
  }

  return (
    <Card>
      <CardTitle className="mb-1 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-accent" /> Meeting Intelligence
      </CardTitle>
      <p className="mb-3 text-sm text-muted-foreground">
        Cole a ata da reunião. A IA gera resumo, decisões e próximas ações.
      </p>

      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        rows={5}
        placeholder="Cole aqui a ata ou transcrição da reunião…"
        className="w-full resize-none rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
      />
      <Button
        onClick={analyze}
        disabled={loading || !raw.trim()}
        variant="accent"
        className="mt-3"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        Analisar reunião
      </Button>

      {result && (
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm font-semibold">{result.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {result.summary}
            </p>
          </div>

          {result.decisions?.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <CircleCheck className="h-3.5 w-3.5" /> Decisões
              </p>
              <ul className="space-y-1">
                {result.decisions.map((d, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-border/50 bg-secondary/30 px-3 py-2 text-sm"
                  >
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.action_items?.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <ListChecks className="h-3.5 w-3.5" /> Próximas ações
              </p>
              <ul className="space-y-1">
                {result.action_items.map((a, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-secondary/30 px-3 py-2 text-sm"
                  >
                    <span>{a.task}</span>
                    <div className="flex shrink-0 gap-1">
                      {a.owner && <Badge variant="primary">{a.owner}</Badge>}
                      {a.due && <Badge variant="outline">{a.due}</Badge>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(result.decisions?.length > 0 || result.action_items?.length > 0) && (
            <Button onClick={save} disabled={saving || saved} className="w-full">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {saved ? "Reunião salva" : "Salvar reunião"}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
