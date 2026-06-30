import { NextResponse } from "next/server";
import { planTasks, type PlannedTask } from "@/lib/ai/planner";
import { aiEnabled } from "@/lib/ai/claude";

/**
 * POST /api/ai/plan
 * Body: { brainDump: string }
 * Returns: { tasks: PlannedTask[], stub?, warning? }
 *
 * Never returns an empty list when there is text: if the AI is unavailable
 * or fails, we split the input into tasks locally and tell the user why.
 */
function splitFallback(text: string): PlannedTask[] {
  return text
    .split(/\r?\n|;/)
    .map((t) => t.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter((t) => t.length > 1)
    .map((title) => ({
      title,
      category: "personal" as const,
      priority: "medium" as const,
      energy_required: "medium" as const,
      estimated_min: 30,
    }));
}

export async function POST(req: Request) {
  const { brainDump } = await req.json();

  if (!brainDump || typeof brainDump !== "string" || !brainDump.trim()) {
    return NextResponse.json({ error: "brainDump is required" }, { status: 400 });
  }

  if (!aiEnabled()) {
    return NextResponse.json({
      tasks: splitFallback(brainDump),
      stub: true,
      warning:
        "IA desligada (configure ANTHROPIC_API_KEY ou GEMINI_API_KEY). Tarefas criadas a partir das suas linhas.",
    });
  }

  try {
    const tasks = await planTasks(brainDump);
    if (!tasks.length) {
      // AI ran but returned nothing usable — don't leave the user with 0.
      return NextResponse.json({
        tasks: splitFallback(brainDump),
        warning:
          "A IA não retornou tarefas estruturadas; usei suas linhas como base.",
      });
    }
    return NextResponse.json({ tasks });
  } catch (err) {
    console.error("[ai/plan]", err);
    const message = err instanceof Error ? err.message : "erro desconhecido";
    return NextResponse.json({
      tasks: splitFallback(brainDump),
      warning: `Falha na IA (${message}). Tarefas criadas a partir das suas linhas.`,
    });
  }
}
