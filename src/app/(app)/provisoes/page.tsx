import { ForecastForm } from "@/features/finance/forecast-form";
import { ForecastView } from "@/features/finance/forecast-view";
import { getForecast } from "@/lib/data";

export default async function ProvisoesPage() {
  const { entries, projection, totals } = await getForecast();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Provisões &amp; Fluxo Futuro
        </h1>
        <p className="mt-1 text-muted-foreground">
          Parcelas pendentes e recebimentos futuros, com projeção mês a mês.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ForecastForm />
        </div>
        <div className="lg:col-span-2">
          <ForecastView
            entries={entries}
            projection={projection}
            totals={totals}
          />
        </div>
      </div>
    </>
  );
}
