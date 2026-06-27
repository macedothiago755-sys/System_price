import { ComingSoon } from "@/components/layout/coming-soon";

export default function WorkPage() {
  return (
    <ComingSoon
      title="Work Hub"
      phase="Fase 2"
      subtitle="Projetos com objetivo, status, prazo e indicadores. Inclui Meeting Intelligence: cole uma ata e a IA gera resumo, decisões, responsáveis e próximas ações."
      features={[
        "Projetos (objetivo, status, prazo)",
        "Tarefas, bloqueios e próximas ações",
        "Decisões pendentes",
        "Meeting Intelligence (ata → resumo IA)",
        "Responsáveis e prazos automáticos",
      ]}
    />
  );
}
