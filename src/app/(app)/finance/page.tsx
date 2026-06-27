import { ComingSoon } from "@/components/layout/coming-soon";

export default function FinancePage() {
  return (
    <ComingSoon
      title="Personal Finance"
      phase="Fase 3"
      subtitle="Receitas, despesas e categorias com um Financial Health Score e um simulador de compras com IA: 'Posso comprar isso?'."
      features={[
        "Receitas e despesas por categoria",
        "Dashboard: receita, gastos, saldo, taxa de investimento",
        "Financial Health Score (reserva, aportes, gastos)",
        "Evolução patrimonial",
        "Simulador IA de compras",
        "Recomendações financeiras",
      ]}
    />
  );
}
