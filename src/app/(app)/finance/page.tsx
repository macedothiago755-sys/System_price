import { FinanceDashboard } from "@/features/finance/finance-dashboard";
import { TransactionForm } from "@/features/finance/transaction-form";
import { PurchaseSimulator } from "@/features/finance/purchase-simulator";
import { MonthFilter } from "@/features/finance/month-filter";
import { getFinanceData } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { formatBRL } from "@/lib/utils";
import { categoryLabel } from "@/lib/finance";

export default async function FinancePage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const { transactions, summary, score, month } = await getFinanceData(
    searchParams.month
  );

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          Personal Finance
        </h1>
        <MonthFilter month={month} />
      </div>

      <FinanceDashboard summary={summary} score={score} />

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <TransactionForm />
        <PurchaseSimulator />

        <Card>
          <h2 className="mb-3 text-sm font-medium">Transações recentes</h2>
          <div className="space-y-2">
            {transactions.slice(0, 8).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/30 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm">
                    {t.description || categoryLabel(t.category)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {categoryLabel(t.category)}
                  </p>
                </div>
                <span
                  className={
                    t.type === "income"
                      ? "text-sm font-medium text-primary"
                      : "text-sm font-medium text-rose-400"
                  }
                >
                  {t.type === "income" ? "+" : "−"}
                  {formatBRL(t.amount)}
                </span>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Adicione sua primeira transação.
              </p>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
