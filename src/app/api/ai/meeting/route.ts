import { NextResponse } from "next/server";
import { analyzeMeeting } from "@/lib/ai/meeting";
import { aiEnabled } from "@/lib/ai/claude";

/** POST /api/ai/meeting  { raw: string } -> structured meeting summary */
export async function POST(req: Request) {
  const { raw } = await req.json();
  if (!raw || typeof raw !== "string") {
    return NextResponse.json({ error: "raw is required" }, { status: 400 });
  }

  if (!aiEnabled()) {
    const firstLine = raw.split("\n").find((l) => l.trim())?.slice(0, 60) ?? "Reunião";
    return NextResponse.json({
      title: firstLine,
      summary:
        "🔌 Configure uma chave de IA (ANTHROPIC_API_KEY ou GEMINI_API_KEY) para gerar resumo, decisões e próximas ações.",
      decisions: [],
      action_items: [],
      stub: true,
    });
  }

  try {
    return NextResponse.json(await analyzeMeeting(raw));
  } catch (err) {
    console.error("[ai/meeting]", err);
    return NextResponse.json({ error: "Failed to analyze" }, { status: 500 });
  }
}
