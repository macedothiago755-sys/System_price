"use client";

import Link from "next/link";
import { CalendarDays, Video, Focus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CalendarEvent } from "@/lib/types";

function fmt(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function AgendaCard({ events }: { events: CalendarEvent[] }) {
  const upcoming = events.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agenda</CardTitle>
        <Badge variant="outline">
          <CalendarDays className="h-3 w-3" /> Próximos
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        {upcoming.length === 0 ? (
          <p className="py-3 text-center text-sm text-muted-foreground">
            Sem eventos.{" "}
            <Link href="/agenda" className="text-primary hover:underline">
              Adicionar
            </Link>
          </p>
        ) : (
          upcoming.map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-secondary/40"
            >
              <span className="w-20 shrink-0 text-xs font-medium capitalize text-muted-foreground">
                {fmt(e.starts_at)}
              </span>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                  e.kind === "meeting"
                    ? "bg-accent/15 text-accent"
                    : e.kind === "focus_block"
                      ? "bg-primary/15 text-primary"
                      : "bg-secondary text-muted-foreground"
                }`}
              >
                {e.kind === "meeting" ? (
                  <Video className="h-4 w-4" />
                ) : e.kind === "focus_block" ? (
                  <Focus className="h-4 w-4" />
                ) : (
                  <CalendarDays className="h-4 w-4" />
                )}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm">{e.title}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
