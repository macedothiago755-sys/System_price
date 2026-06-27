import { ComingSoon } from "@/components/layout/coming-soon";

export default function GoalsPage() {
  return (
    <ComingSoon
      title="Goals Dashboard"
      phase="Fase 2"
      subtitle="Metas por categoria com progresso, histórico e próximas ações. Inclui a Weekly Review com relatório gerado por IA."
      features={[
        "Metas: financeiro, saúde, carreira, relacionamento, aprendizado",
        "Progresso e histórico",
        "Próximas ações",
        "Weekly Review (o que deu certo/errado/aprendi)",
        "Relatório semanal por IA",
      ]}
    />
  );
}
