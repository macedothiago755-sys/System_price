"use client";

import { CalendarDays, Video, Focus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const events = [
  { time: "08:00", title: "Bloco de foco — Campanha", kind: "focus" },
  { time: "11:30", title: "Almoço + caminhada", kind: "appointment" },
  { time: "14:00", title: "Reunião com cliente", kind: "meeting" },
  { time: "17:00", title: "Estudo de IA", kind: "focus" },
];

export function AgendaCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agenda</CardTitle>
        <Badge variant="outline">
          <CalendarDays className="h-3 w-3" /> Google Calendar (em breve)
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        {events.map((e) => (
          <div
            key={e.time}
            className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-secondary/40"
          >
            <span className="w-12 text-sm font-medium text-muted-foreground">
              {e.time}
            </span>
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                e.kind === "meeting"
                  ? "bg-accent/15 text-accent"
                  : e.kind === "focus"
                    ? "bg-primary/15 text-primary"
                    : "bg-secondary text-muted-foreground"
              }`}
            >
              {e.kind === "meeting" ? (
                <Video className="h-4 w-4" />
              ) : e.kind === "focus" ? (
                <Focus className="h-4 w-4" />
              ) : (
                <CalendarDays className="h-4 w-4" />
              )}
            </span>
            <span className="text-sm">{e.title}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
