import { ComingSoon } from "@/components/layout/coming-soon";

export default function HealthPage() {
  return (
    <ComingSoon
      title="Health Intelligence"
      phase="Fase 3"
      subtitle="Cruzamento entre saúde e produtividade. Integração futura com Polar Flow para sono, recuperação, HRV e carga de treino — gerando seu Performance Score."
      features={[
        "Sono, score de sono e duração",
        "Recuperação, FC e HRV",
        "Carga de treino, passos e calorias",
        "Integração Polar Flow API",
        "Performance Score (sono + treino + humor + foco + execução)",
        "Insights: saúde × produtividade",
      ]}
    />
  );
}
