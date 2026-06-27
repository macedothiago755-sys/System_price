import { Topbar } from "@/components/layout/topbar";
import { StateCard } from "@/features/dashboard/state-card";
import { PrioritiesCard } from "@/features/dashboard/priorities-card";
import { AgendaCard } from "@/features/dashboard/agenda-card";
import { InsightsCard } from "@/features/dashboard/insights-card";
import { greeting, formatLongDate } from "@/lib/utils";
import { getDashboardData } from "@/lib/data";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <>
      <Topbar
        level={data.profile.level}
        xp={data.profile.xp}
        streak={data.profile.streak_days}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {greeting()}, {data.profile.full_name ?? "por aqui"}.
        </h1>
        <p className="mt-1 capitalize text-muted-foreground">
          {formatLongDate()}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <StateCard checkin={data.checkin} health={data.health} />
          <PrioritiesCard priorities={data.priorities} />
        </div>
        <div className="space-y-5">
          <AgendaCard />
          <InsightsCard insights={data.insights} />
        </div>
      </div>
    </>
  );
}
