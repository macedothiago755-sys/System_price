import { askClaudeJSON } from "./claude";
import type { TaskCategory, TaskPriority, EnergyLevel } from "@/lib/types";

export interface PlannedTask {
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  energy_required: EnergyLevel;
  estimated_min: number;
}

const PLANNER_SYSTEM = `Você é o motor de planejamento do THIAGO OS, um sistema operacional pessoal.
Recebe tarefas soltas escritas pelo usuário e as organiza.
Para cada tarefa defina: category (work|personal|health|finance|learning),
priority (low|medium|high|urgent), energy_required (low|medium|high) e
estimated_min (estimativa realista em minutos).`;

/** Turn a free-text brain dump into structured, prioritized tasks. */
export async function planTasks(brainDump: string): Promise<PlannedTask[]> {
  const res = await askClaudeJSON<{ tasks: PlannedTask[] }>(
    `Organize estas tarefas soltas:\n\n${brainDump}\n\nRetorne { "tasks": [...] }.`,
    { system: PLANNER_SYSTEM, maxTokens: 1500 }
  );
  return res.tasks ?? [];
}

const BREAKDOWN_SYSTEM = `Você quebra tarefas grandes em subtarefas pequenas e acionáveis
para combater a procrastinação. Cada passo deve ser concreto e começar com um verbo.`;

/** Break a single large task into actionable subtasks. */
export async function breakdownTask(title: string): Promise<string[]> {
  const res = await askClaudeJSON<{ steps: string[] }>(
    `Quebre a tarefa "${title}" em 3 a 7 passos acionáveis. Retorne { "steps": [...] }.`,
    { system: BREAKDOWN_SYSTEM, maxTokens: 600 }
  );
  return res.steps ?? [];
}
