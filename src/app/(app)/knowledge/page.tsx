import { KnowledgeHub } from "@/features/knowledge/knowledge-hub";
import { getNotes } from "@/lib/data";

export default async function KnowledgePage() {
  const { notes } = await getNotes();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Knowledge Hub</h1>
        <p className="mt-1 text-muted-foreground">
          Notas, ideias e documentos — com busca por IA.
        </p>
      </div>
      <KnowledgeHub notes={notes} />
    </>
  );
}
