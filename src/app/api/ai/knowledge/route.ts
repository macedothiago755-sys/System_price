import { NextResponse } from "next/server";
import { askClaude, aiEnabled } from "@/lib/ai/claude";
import { getNotes } from "@/lib/data";

const SYSTEM = `Você é a busca inteligente do Knowledge Hub do THIAGO OS. Recebe uma pergunta e
as notas do usuário. Responda de forma direta usando SOMENTE o conteúdo das notas,
citando os títulos relevantes. Se nada for relevante, diga isso. Português do Brasil.`;

/** POST /api/ai/knowledge  { query: string } -> { answer } over the user's notes */
export async function POST(req: Request) {
  const { query } = await req.json();
  if (!query?.trim()) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  const { notes } = await getNotes();

  if (!aiEnabled()) {
    const q = query.toLowerCase();
    const hits = notes.filter(
      (n) =>
        n.title?.toLowerCase().includes(q) ||
        n.content?.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
    );
    return NextResponse.json({
      answer: hits.length
        ? `Encontrei ${hits.length} nota(s): ${hits
            .map((n) => `“${n.title}”`)
            .join(", ")}. 🔌 Configure uma chave de IA para respostas sintetizadas.`
        : "Nenhuma nota corresponde à busca.",
      stub: true,
    });
  }

  try {
    const corpus = notes
      .map((n) => `### ${n.title}\n${n.content ?? ""}\n(tags: ${n.tags.join(", ")})`)
      .join("\n\n");
    const answer = await askClaude(
      `Pergunta: ${query}\n\nNotas do usuário:\n${corpus}`,
      { system: SYSTEM, maxTokens: 700 }
    );
    return NextResponse.json({ answer });
  } catch (err) {
    console.error("[ai/knowledge]", err);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
