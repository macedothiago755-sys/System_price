import { NextResponse } from "next/server";
import { askClaudeJSON, aiEnabled } from "@/lib/ai/claude";
import { getFinanceData } from "@/lib/data";

interface PurchaseVerdict {
  verdict: "sim" | "talvez" | "nao";
  headline: string;
  impact: string;
  recommendation: string;
}

const SYSTEM = `Você é o simulador de compras do THIAGO OS. Dado um item, um preço e o
contexto financeiro do usuário (receita, gastos, saldo e taxa de investimento dos
últimos 30 dias), avalie se ele deveria comprar.
Responda em JSON: { "verdict": "sim"|"talvez"|"nao", "headline": string curta,
"impact": frase sobre o impacto no saldo/objetivos, "recommendation": conselho prático }.
Seja honesto, direto e em português do Brasil.`;

/** POST /api/ai/purchase  { item: string, price: number } */
export async function POST(req: Request) {
  const { item, price } = await req.json();
  if (!item || !price) {
    return NextResponse.json(
      { error: "item and price are required" },
      { status: 400 }
    );
  }

  const { summary } = await getFinanceData();

  if (!aiEnabled()) {
    const affordable = price <= summary.balance * 0.3;
    const stub: PurchaseVerdict = {
      verdict: affordable ? "sim" : price <= summary.balance ? "talvez" : "nao",
      headline: affordable
        ? "Cabe no seu orçamento."
        : "Pese bem antes de comprar.",
      impact: `Representa ${
        summary.balance > 0
          ? Math.round((price / summary.balance) * 100)
          : 100
      }% do seu saldo dos últimos 30 dias.`,
      recommendation:
        "🔌 Configure uma chave de IA (ANTHROPIC_API_KEY ou GEMINI_API_KEY) para uma análise completa.",
    };
    return NextResponse.json({ ...stub, stub: true });
  }

  try {
    const result = await askClaudeJSON<PurchaseVerdict>(
      `Item: ${item}\nPreço: R$ ${price}\nContexto financeiro (30d): ${JSON.stringify(summary)}`,
      { system: SYSTEM, maxTokens: 500 }
    );
    return NextResponse.json(result);
  } catch (err) {
    console.error("[ai/purchase]", err);
    return NextResponse.json({ error: "Failed to analyze" }, { status: 500 });
  }
}
