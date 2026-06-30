import { ForecastForm } from "@/features/finance/forecast-form";
import { ForecastView } from "@/features/finance/forecast-view";
import { ForecastFilter } from "@/features/finance/forecast-filter";
import { getForecast } from "@/lib/data";

export default async function ProvisoesPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const { entries, projection, totals, from, to } = await getForecast({
    from: searchParams.from,
    to: searchParams.to,
  });

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Provisões &amp; Fluxo Futuro
          </h1>
          <p className="mt-1 text-muted-foreground">
            Parcelas e recebimentos com projeção mês a mês.
          </p>
        </div>
        <ForecastFilter from={from} to={to} />
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
