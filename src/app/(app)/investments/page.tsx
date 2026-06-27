import { Portfolio } from "@/features/investments/portfolio";
import { getInvestmentsData } from "@/lib/data";

export default async function InvestmentsPage() {
  const { investments, total } = await getInvestmentsData();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Investimentos</h1>
        <p className="mt-1 text-muted-foreground">
          Patrimônio, evolução e distribuição da sua carteira.
        </p>
      </div>
      <Portfolio investments={investments} total={total} />
    </>
  );
}
