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
Recebe texto livre do usuário — pode ser uma lista de tarefas soltas OU uma rotina
semanal com horários e dias da semana — e transforma em tarefas acionáveis.

Regras:
- Cada item/atividade vira UMA tarefa. Se houver rotina com horários (ex.: "Segunda
  7:00 café da manhã"), crie uma tarefa por atividade e inclua o dia/horário no título
  quando fizer sentido (ex.: "Seg 7h — Café da manhã").
- SEMPRE retorne pelo menos uma tarefa quando houver qualquer conteúdo.
- Para cada tarefa defina: title (string), category (work|personal|health|finance|learning),
  priority (low|medium|high|urgent), energy_required (low|medium|high) e
  estimated_min (inteiro, estimativa realista em minutos).
- Responda em português do Brasil.`;

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
