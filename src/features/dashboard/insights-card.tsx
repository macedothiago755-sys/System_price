"use client";

import { Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { mockInsights } from "@/lib/mock-data";

export function InsightsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights da IA</CardTitle>
        <Sparkles className="h-4 w-4 text-accent" />
      </CardHeader>
      <CardContent className="space-y-3">
        {mockInsights.map((insight) => (
          <div
            key={insight.id}
            className="rounded-xl border border-border/50 bg-secondary/30 p-4"
          >
            <p className="text-sm font-medium">{insight.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{insight.body}</p>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${insight.confidence * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
