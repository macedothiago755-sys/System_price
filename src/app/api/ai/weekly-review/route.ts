import { NextResponse } from "next/server";
import { generateWeeklyReview } from "@/lib/ai/review";
import { aiEnabled } from "@/lib/ai/claude";

/** POST /api/ai/weekly-review  { went_well, went_wrong, learned, change } */
export async function POST(req: Request) {
  const body = await req.json();

  if (!aiEnabled()) {
    return NextResponse.json({
      report:
        "🔌 **Modo demo.** Configure `ANTHROPIC_API_KEY` ou `GEMINI_API_KEY` para gerar um relatório " +
        "semanal personalizado a partir das suas respostas e dos seus dados " +
        "(check-ins, saúde, tarefas e finanças).\n\n" +
        `**O que deu certo:** ${body.went_well || "—"}\n\n` +
        `**A melhorar:** ${body.went_wrong || "—"}`,
      stub: true,
    });
  }

  try {
    const report = await generateWeeklyReview(body);
    return NextResponse.json({ report });
  } catch (err) {
    console.error("[ai/weekly-review]", err);
    return NextResponse.json({ error: "Failed to generate" }, { status: 500 });
  }
}
