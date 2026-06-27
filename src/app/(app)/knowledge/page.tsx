import { ComingSoon } from "@/components/layout/coming-soon";

export default function KnowledgePage() {
  return (
    <ComingSoon
      title="Knowledge Hub"
      phase="Fase 2"
      subtitle="Notas, cursos, ideias e documentos organizados automaticamente, com busca por IA."
      features={[
        "Notas, ideias e documentos",
        "Organização automática por IA",
        "Busca semântica",
        "Tags inteligentes",
      ]}
    />
  );
}
