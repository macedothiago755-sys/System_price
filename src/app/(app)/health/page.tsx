import { HealthDashboard } from "@/features/health/health-dashboard";
import { HealthLogForm } from "@/features/health/health-log-form";
import { Card, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { getHealthData } from "@/lib/data";

export default async function HealthPage() {
  const { latest, history } = await getHealthData();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Health Intelligence
        </h1>
        <p className="mt-1 text-muted-foreground">
          Onde saúde encontra produtividade.
        </p>
      </div>

      <HealthDashboard latest={latest} history={history} />

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <HealthLogForm />

        <Card>
          <CardTitle className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            Saúde × Produtividade
          </CardTitle>
          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-border/50 bg-secondary/30 p-3">
              Nos últimos 30 dias, quando seu sono passa de 7h, sua taxa de
              conclusão de tarefas sobe ~24%.
            </div>
            <div className="rounded-xl border border-border/50 bg-secondary/30 p-3">
              Após treinos com carga &gt; 300, sua produtividade na tarde tende a
              cair. Reserve tarefas leves nesses dias.
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
