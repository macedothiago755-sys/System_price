import type { TxType } from "@/lib/types";

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  category: string;
  description: string | null;
  date: string;
}

export interface FinanceSummary {
  income: number;
  expense: number;
  balance: number;
  investRate: number; // % of income going to investments
  byCategory: { category: string; total: number }[];
}

/** Aggregate a list of transactions into the dashboard summary. */
export function summarize(transactions: Transaction[]): FinanceSummary {
  let income = 0;
  let expense = 0;
  let invested = 0;
  const cat = new Map<string, number>();

  for (const t of transactions) {
    if (t.type === "income") {
      income += t.amount;
    } else {
      expense += t.amount;
      cat.set(t.category, (cat.get(t.category) ?? 0) + t.amount);
      if (t.category === "investimentos") invested += t.amount;
    }
  }

  return {
    income,
    expense,
    balance: income - expense,
    investRate: income > 0 ? Math.round((invested / income) * 100) : 0,
    byCategory: [...cat.entries()]
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total),
  };
}

/**
 * Financial Health Score (0–100) — mirrors the SQL `financial_health_score`.
 * Currently the trailing savings rate; weighted blend planned for later.
 */
export function financialHealthScore(summary: FinanceSummary): number {
  if (summary.income <= 0) return 0;
  return Math.max(
    0,
    Math.min(100, Math.round((summary.balance / summary.income) * 100))
  );
}

export const EXPENSE_CATEGORIES = [
  "moradia",
  "alimentacao",
  "transporte",
  "lazer",
  "investimentos",
  "estudos",
  "saude",
  "impostos",
  "beleza",
  "viagens",
  "outros",
] as const;

/** Display labels (with accents) for expense + income categories. */
export const CATEGORY_LABELS: Record<string, string> = {
  receita: "Receita",
  salario: "Salário",
  freela: "Freelance",
  moradia: "Moradia",
  alimentacao: "Alimentação",
  transporte: "Transporte",
  lazer: "Lazer",
  investimentos: "Investimentos",
  estudos: "Estudos",
  saude: "Saúde",
  impostos: "Impostos",
  beleza: "Beleza",
  viagens: "Viagens",
  outros: "Outros",
};

export const categoryLabel = (c: string): string =>
  CATEGORY_LABELS[c] ?? c.charAt(0).toUpperCase() + c.slice(1);
