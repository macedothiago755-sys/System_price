import { NextResponse } from "next/server";
import { askClaude, aiEnabled } from "@/lib/ai/claude";
import { buildUserContext } from "@/lib/ai/context";

const SYSTEM = `Você é o Assistente do THIAGO OS — um copiloto pessoal que conhece a vida do
usuário. Você recebe um snapshot real dele: check-ins recentes (energia, foco,
humor, sono), saúde (recuperação, HRV, treino), tarefas abertas, finanças dos
últimos 30 dias, dívidas/provisões pendentes e metas.

Como agir:
- Quando o usuário desabafar ou pedir conselho (ex.: "estou muito estressado"),
  CONECTE os pontos do contexto: se o sono está baixo, se há dívidas pendentes,
  se as tarefas estão acumuladas — e relacione isso ao que ele está sentindo.
- Seja empático e humano primeiro; depois, prático. Dê 1–3 ações concretas e
  realistas baseadas nos dados reais dele, não conselhos genéricos.
- Cite números do contexto quando ajudar (ex.: "você dormiu 5h ontem", "tem
  R$ X em contas a pagar este mês").
- Nunca invente dados que não estão no contexto. Se faltar informação, peça.
Responda em português do Brasil, com tom acolhedor e direto.`;

/**
 * POST /api/ai/chat  { message: string, context?: object }
 * In Phase 2, `context` is built server-side from the user's real data.
 */
export async function POST(req: Request) {
  const { message } = await req.json();

  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  if (!aiEnabled()) {
    return NextResponse.json({
      reply:
        "🔌 Configure ANTHROPIC_API_KEY ou GEMINI_API_KEY no .env.local para ativar o assistente. " +
        "Quando ativo, eu uso seus dados (sono, energia, tarefas, finanças) para responder de verdade.",
      stub: true,
    });
  }

  try {
    // Build the user snapshot server-side (never trust client-sent context).
    const context = await buildUserContext();
    const contextBlock = context
      ? `\n\n[Contexto do usuário — use para personalizar a resposta]\n${JSON.stringify(context)}`
      : "";
    const reply = await askClaude(message + contextBlock, {
      system: SYSTEM,
      maxTokens: 1024,
    });
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[ai/chat]", err);
    return NextResponse.json({ error: "Failed to reply" }, { status: 500 });
  }
}
