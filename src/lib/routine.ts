// Pillars (categorias) da rotina + a Rotina Base do Thiago, codificada como
// dados — carregável com 1 clique, sem IA.

export const WEEKDAYS = [
  { value: 1, label: "Segunda-feira", short: "Seg" },
  { value: 2, label: "Terça-feira", short: "Ter" },
  { value: 3, label: "Quarta-feira", short: "Qua" },
  { value: 4, label: "Quinta-feira", short: "Qui" },
  { value: 5, label: "Sexta-feira", short: "Sex" },
  { value: 6, label: "Sábado", short: "Sáb" },
  { value: 7, label: "Domingo", short: "Dom" },
] as const;

export const PILLARS: Record<string, { label: string; color: string }> = {
  trabalho: { label: "Trabalho", color: "text-accent" },
  saude: { label: "Saúde", color: "text-rose-400" },
  nutricao: { label: "Nutrição", color: "text-emerald-400" },
  relacionamento: { label: "Relacionamento", color: "text-pink-400" },
  desenvolvimento: { label: "Desenvolvimento", color: "text-violet-400" },
  espanhol: { label: "Espanhol", color: "text-amber-400" },
  financeiro: { label: "Financeiro", color: "text-primary" },
  leitura: { label: "Leitura", color: "text-sky-400" },
  geral: { label: "Geral", color: "text-muted-foreground" },
};

export const pillarLabel = (c: string) => PILLARS[c]?.label ?? c;

export interface RoutineSeed {
  weekday: number;
  start_time: string | null;
  end_time: string | null;
  title: string;
  category: string;
  notes?: string;
}

/** Rotina Operacional do Thiago — base executável, dia a dia. */
export const BASE_ROUTINE: RoutineSeed[] = [
  // ── Segunda ──────────────────────────────────────────────
  { weekday: 1, start_time: "07:00", end_time: "08:30", title: "Café, banho, preparação e deslocamento", category: "geral" },
  { weekday: 1, start_time: "09:00", end_time: "18:00", title: "Trabalho presencial na Polar", category: "trabalho" },
  { weekday: 1, start_time: "19:15", end_time: "22:30", title: "MBA Ecommerce", category: "desenvolvimento" },
  { weekday: 1, start_time: "22:30", end_time: "23:00", title: "Desaceleração + leitura 15 min (Goggins — 5 págs)", category: "leitura" },

  // ── Terça ────────────────────────────────────────────────
  { weekday: 2, start_time: "07:00", end_time: "08:00", title: "Treino", category: "saude" },
  { weekday: 2, start_time: "08:00", end_time: "09:00", title: "Banho, café e preparação", category: "geral" },
  { weekday: 2, start_time: "09:00", end_time: "12:00", title: "Polar", category: "trabalho" },
  { weekday: 2, start_time: "12:00", end_time: "13:00", title: "Almoço", category: "nutricao" },
  { weekday: 2, start_time: "13:00", end_time: "17:00", title: "Polar — Home Office", category: "trabalho" },
  { weekday: 2, start_time: "17:00", end_time: "19:00", title: "Janela estratégica: Espanhol (Sem. A) / Desenvolvimento (Sem. B)", category: "espanhol", notes: "Semana A: Duolingo, vocabulário, escuta, conversação. Semana B: Claude Code, IA, projetos." },
  { weekday: 2, start_time: "19:15", end_time: "22:30", title: "Curso Inteligência de Mercado", category: "desenvolvimento" },
  { weekday: 2, start_time: "22:30", end_time: null, title: "Leitura 15 minutos", category: "leitura" },

  // ── Quarta ───────────────────────────────────────────────
  { weekday: 3, start_time: "07:00", end_time: "08:30", title: "Café, banho e preparação", category: "geral" },
  { weekday: 3, start_time: "09:00", end_time: "18:00", title: "Polar presencial", category: "trabalho" },
  { weekday: 3, start_time: "19:15", end_time: "22:30", title: "MBA Ecommerce", category: "desenvolvimento" },
  { weekday: 3, start_time: "22:30", end_time: "23:00", title: "Leitura e preparar o sono", category: "leitura" },

  // ── Quinta ───────────────────────────────────────────────
  { weekday: 4, start_time: "07:00", end_time: "08:00", title: "Treino", category: "saude" },
  { weekday: 4, start_time: "09:00", end_time: "12:00", title: "Polar", category: "trabalho" },
  { weekday: 4, start_time: "12:00", end_time: "13:00", title: "Almoço", category: "nutricao" },
  { weekday: 4, start_time: "13:00", end_time: "17:00", title: "Polar — Home Office", category: "trabalho" },
  { weekday: 4, start_time: "17:00", end_time: "19:00", title: "Bloco de crescimento: IA / Claude Code / Projetos / Espanhol", category: "desenvolvimento", notes: "Prioridade: construção de futuro." },
  { weekday: 4, start_time: "19:15", end_time: "22:30", title: "Curso Inteligência de Mercado", category: "desenvolvimento" },
  { weekday: 4, start_time: "22:30", end_time: null, title: "Leitura 15 minutos", category: "leitura" },

  // ── Sexta ────────────────────────────────────────────────
  { weekday: 5, start_time: "07:00", end_time: "08:00", title: "Treino", category: "saude" },
  { weekday: 5, start_time: "09:00", end_time: "12:00", title: "Polar", category: "trabalho" },
  { weekday: 5, start_time: "12:00", end_time: "13:00", title: "Almoço", category: "nutricao" },
  { weekday: 5, start_time: "13:00", end_time: "17:00", title: "Polar — Home Office", category: "trabalho" },
  { weekday: 5, start_time: "19:00", end_time: null, title: "Noite livre — Relacionamento (sair, jantar, tempo de qualidade)", category: "relacionamento", notes: "Não colocar estudo pesado." },

  // ── Sábado ───────────────────────────────────────────────
  { weekday: 6, start_time: "09:00", end_time: "12:00", title: "Deep Work: THIAGO OS, projetos, IA", category: "desenvolvimento" },
  { weekday: 6, start_time: "12:00", end_time: null, title: "Tarde: vida pessoal (família, pendências, lazer)", category: "relacionamento" },
  { weekday: 6, start_time: "16:00", end_time: null, title: "Espanhol — 30 min", category: "espanhol" },

  // ── Domingo (ritual semanal) ─────────────────────────────
  { weekday: 7, start_time: "09:00", end_time: "11:00", title: "Preparação alimentar — marmitas da semana", category: "nutricao", notes: "Proteína 200g/dia · Água 2L+ · ~2300 kcal" },
  { weekday: 7, start_time: "11:00", end_time: "11:30", title: "Financeiro — atualizar gastos, cartões, investimentos e patrimônio", category: "financeiro" },
  { weekday: 7, start_time: "11:30", end_time: "12:00", title: "Planejamento semanal (prioridades, compromissos, treinos, estudos)", category: "geral" },
];
