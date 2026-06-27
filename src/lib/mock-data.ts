// Demo data so the UI is fully navigable before Supabase credentials exist.
// Every screen reads from here today; swap these calls for real queries in Phase 2.

import type { Task, HealthMetric, AiInsight, DailyCheckin } from "./types";

export const mockProfile = {
  full_name: "Thiago",
  xp: 2480,
  level: 12,
  streak_days: 15,
};

export const mockCheckin: DailyCheckin = {
  id: "demo",
  date: new Date().toISOString().slice(0, 10),
  energy: 8,
  mood: "great",
  sleep_hours: 7.4,
  focus: 9,
  main_concern: "Fechar a proposta do cliente novo",
  win_of_day: "Treinar e enviar a campanha",
};

export const mockHealth: HealthMetric = {
  date: new Date().toISOString().slice(0, 10),
  sleep_score: 84,
  sleep_duration: 7.4,
  recovery_score: 78,
  heart_rate: 58,
  hrv: 72,
  training_load: 320,
  steps: 8420,
  calories: 2380,
};

export const mockPriorities = [
  {
    id: "p1",
    title: "Criar campanha do cliente novo",
    estimated_min: 90,
    energy: "high" as const,
    reason: "Maior impacto e prazo curto — faça primeiro com a energia alta de hoje.",
  },
  {
    id: "p2",
    title: "Estudar IA — bloco de 45min",
    estimated_min: 45,
    energy: "medium" as const,
    reason: "Mantém a meta de aprendizado e a sequência de estudo.",
  },
  {
    id: "p3",
    title: "Responder cliente e pagar conta",
    estimated_min: 20,
    energy: "low" as const,
    reason: "Tarefas rápidas — agrupe no fim do dia.",
  },
];

export const mockTasks: Task[] = [
  {
    id: "t1",
    parent_id: null,
    title: "Criar campanha do cliente novo",
    description: "Campanha de lançamento para o produto X",
    category: "work",
    priority: "high",
    status: "in_progress",
    energy_required: "high",
    estimated_min: 90,
    blocker: null,
    due_date: null,
  },
  {
    id: "t2",
    parent_id: null,
    title: "Estudar IA",
    description: null,
    category: "learning",
    priority: "medium",
    status: "todo",
    energy_required: "medium",
    estimated_min: 45,
    blocker: null,
    due_date: null,
  },
  {
    id: "t3",
    parent_id: null,
    title: "Pagar conta de energia",
    description: null,
    category: "finance",
    priority: "urgent",
    status: "todo",
    energy_required: "low",
    estimated_min: 10,
    blocker: null,
    due_date: null,
  },
  {
    id: "t4",
    parent_id: null,
    title: "Treino de força",
    description: "Push day",
    category: "health",
    priority: "medium",
    status: "done",
    energy_required: "high",
    estimated_min: 60,
    blocker: null,
    due_date: null,
  },
];

export const mockInsights: AiInsight[] = [
  {
    id: "i1",
    source_module: "health",
    title: "Sono x execução",
    body: "Nos últimos 30 dias, quando seu sono passa de 7h, sua taxa de conclusão de tarefas sobe ~24%.",
    confidence: 0.82,
  },
  {
    id: "i2",
    source_module: "tasks",
    title: "Pico da manhã",
    body: "Você costuma render mais entre 8h e 11h. Reserve esse bloco para tarefas estratégicas.",
    confidence: 0.74,
  },
  {
    id: "i3",
    source_module: "health",
    title: "Pós-treino intenso",
    body: "Após treinos com carga > 300, sua produtividade na tarde cai. Considere tarefas leves nesses dias.",
    confidence: 0.68,
  },
];
