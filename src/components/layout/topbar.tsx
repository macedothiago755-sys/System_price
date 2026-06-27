"use client";

import { Flame, Zap } from "lucide-react";
import { mockProfile } from "@/lib/mock-data";
import { xpForLevel } from "@/lib/types";
import { Progress } from "@/components/ui/progress";

export function Topbar() {
  const nextLevelXp = xpForLevel(mockProfile.level + 1);
  const pct = Math.min(100, (mockProfile.xp / nextLevelXp) * 100);

  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-sm font-medium text-warning">
          <Flame className="h-4 w-4" />
          {mockProfile.streak_days} dias
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-sm font-medium text-accent">
          <Zap className="h-4 w-4" />
          Level {mockProfile.level}
        </div>
      </div>

      <div className="flex w-48 flex-col gap-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>XP</span>
          <span>
            {mockProfile.xp} / {nextLevelXp}
          </span>
        </div>
        <Progress value={pct} indicatorClassName="bg-accent" />
      </div>
    </header>
  );
}
