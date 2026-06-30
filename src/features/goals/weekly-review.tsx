"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const questions = [
  { key: "went_well", label: "O que deu certo?" },
  { key: "went_wrong", label: "O que deu errado?" },
  { key: "learned", label: "O que aprendi?" },
  { key: "change", label: "O que devo mudar?" },
] as const;

export function WeeklyReview() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setReport(null);
    try {
      const res = await fetch("/api/ai/weekly-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      const data = await res.json();
      setReport(data.report ?? data.error ?? "...");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardTitle className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-accent" /> Weekly Review
      </CardTitle>
      <div className="space-y-3">
        {questions.map((q) => (
          <div key={q.key}>
            <label className="mb-1 block text-sm font-medium">{q.label}</label>
            <textarea
              rows={2}
              value={answers[q.key] ?? ""}
              onChange={(e) =>
                setAnswers((a) => ({ ...a, [q.key]: e.target.value }))
              }
              className="w-full resize-none rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        ))}
        <Button
          onClick={generate}
          disabled={loading}
          variant="accent"
          className="w-full"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Gerar relatório semanal
        </Button>
      </div>

      {report && (
        <div className="mt-4 whitespace-pre-wrap rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm">
          {report}
        </div>
      )}
    </Card>
  );
}
