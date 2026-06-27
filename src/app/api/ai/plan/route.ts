import { NextResponse } from "next/server";
import { planTasks } from "@/lib/ai/planner";

/**
 * POST /api/ai/plan
 * Body: { brainDump: string }
 * Returns: { tasks: PlannedTask[] }
 *
 * Falls back to a deterministic stub when ANTHROPIC_API_KEY is not set,
 * so the UI works end-to-end during local development.
 */
export async function POST(req: Request) {
  const { brainDump } = await req.json();

  if (!brainDump || typeof brainDump !== "string") {
    return NextResponse.json({ error: "brainDump is required" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    const tasks = brainDump
      .split(/\n|,|;/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((title) => ({
        title,
        category: "work" as const,
        priority: "medium" as const,
        energy_required: "medium" as const,
        estimated_min: 30,
      }));
    return NextResponse.json({ tasks, stub: true });
  }

  try {
    const tasks = await planTasks(brainDump);
    return NextResponse.json({ tasks });
  } catch (err) {
    console.error("[ai/plan]", err);
    return NextResponse.json(
      { error: "Failed to plan tasks" },
      { status: 500 }
    );
  }
}
