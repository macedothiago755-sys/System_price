import { ComingSoon } from "@/components/layout/coming-soon";

export default function InvestmentsPage() {
  return (
    <ComingSoon
      title="Investimentos"
      phase="Fase 3"
      subtitle="Sua carteira de ativos com patrimônio, evolução e distribuição."
      features={[
        "Carteira de ativos (nome, tipo, valor)",
        "Rentabilidade e objetivo",
        "Patrimônio total",
        "Evolução e distribuição",
      ]}
    />
  );
}
