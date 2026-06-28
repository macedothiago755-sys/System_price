import { NextResponse } from "next/server";
import { askClaude, aiEnabled } from "@/lib/ai/claude";
import { buildUserContext } from "@/lib/ai/context";

const SYSTEM = `Você é o Assistente do THIAGO OS, um sistema operacional pessoal.
Você tem acesso ao contexto do usuário (energia, sono, tarefas, finanças, metas)
e ajuda a organizar a vida, aumentar a produtividade e evoluir.
Seja direto, prático e motivador. Responda em português do Brasil.`;

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
