"use client";

import { Flame, Zap } from "lucide-react";
import { xpForLevel } from "@/lib/types";
import { Progress } from "@/components/ui/progress";

export function Topbar({
  level,
  xp,
  streak,
}: {
  level: number;
  xp: number;
  streak: number;
}) {
  const nextLevelXp = xpForLevel(level + 1);
  const pct = Math.min(100, (xp / nextLevelXp) * 100);

  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-sm font-medium text-warning">
          <Flame className="h-4 w-4" />
          {streak} dias
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-sm font-medium text-accent">
          <Zap className="h-4 w-4" />
          Level {level}
        </div>
      </div>

      <div className="flex w-48 flex-col gap-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>XP</span>
          <span>
            {xp} / {nextLevelXp}
          </span>
        </div>
        <Progress value={pct} indicatorClassName="bg-accent" />
      </div>
    </header>
  );
}
