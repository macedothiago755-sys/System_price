import { Topbar } from "@/components/layout/topbar";
import { StateCard } from "@/features/dashboard/state-card";
import { PrioritiesCard } from "@/features/dashboard/priorities-card";
import { AgendaCard } from "@/features/dashboard/agenda-card";
import { InsightsCard } from "@/features/dashboard/insights-card";
import { greeting, formatLongDate } from "@/lib/utils";
import { mockProfile } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <>
      <Topbar />

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {greeting()}, {mockProfile.full_name}.
        </h1>
        <p className="mt-1 capitalize text-muted-foreground">
          {formatLongDate()}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <StateCard />
          <PrioritiesCard />
        </div>
        <div className="space-y-5">
          <AgendaCard />
          <InsightsCard />
        </div>
      </div>
    </>
  );
}
