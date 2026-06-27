import { ComingSoon } from "@/components/layout/coming-soon";

export default function AgendaPage() {
  return (
    <ComingSoon
      title="Agenda"
      phase="Fase 4"
      subtitle="Reuniões, compromissos e blocos de foco em um só lugar, com integração ao Google Calendar."
      features={[
        "Integração Google Calendar",
        "Blocos de foco automáticos",
        "Reuniões e compromissos",
        "Sugestão de agenda pela IA",
      ]}
    />
  );
}
