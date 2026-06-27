"use client";

import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Verdict {
  verdict: "sim" | "talvez" | "nao";
  headline: string;
  impact: string;
  recommendation: string;
}

const verdictStyle = {
  sim: { icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
  talvez: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10 border-warning/20" },
  nao: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
} as const;

export function PurchaseSimulator() {
  const [item, setItem] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Verdict | null>(null);

  async function handleAsk() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item, price: Number(price) }),
      });
      setResult(await res.json());
    } finally {
      setLoading(false);
    }
  }

  const style = result ? verdictStyle[result.verdict] : null;

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-accent" />
        <h2 className="text-sm font-medium">Posso comprar isso?</h2>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">
        A IA analisa preço, impacto no saldo e seus objetivos.
      </p>

      <div className="space-y-2">
        <input
          value={item}
          onChange={(e) => setItem(e.target.value)}
          placeholder="O que você quer comprar?"
          className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Preço (R$)"
          className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <Button
        onClick={handleAsk}
        disabled={loading || !item.trim() || !price}
        variant="accent"
        className="mt-3 w-full"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        Analisar com IA
      </Button>

      {result && style && (
        <div className={`mt-4 rounded-xl border p-4 ${style.bg}`}>
          <div className="flex items-center gap-2">
            <style.icon className={`h-5 w-5 ${style.color}`} />
            <p className={`font-semibold ${style.color}`}>{result.headline}</p>
          </div>
          <p className="mt-2 text-sm">{result.impact}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {result.recommendation}
          </p>
        </div>
      )}
    </Card>
  );
}
