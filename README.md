# THIAGO OS — Sistema Operacional Pessoal com IA

> Não organize apenas tarefas. Organize a pessoa que executa as tarefas.

THIAGO OS é um **segundo cérebro pessoal com IA** — um "Centro de Controle da
Vida" que reúne vida, trabalho, saúde, finanças e evolução pessoal em uma única
aplicação premium, pensada para uso diário.

Você abre todos os dias e recebe: visão do dia, estado físico, energia,
prioridades, agenda, tarefas, recomendações da IA e acompanhamento de metas.

---

## ✨ Stack

| Camada        | Tecnologia                                   |
| ------------- | -------------------------------------------- |
| Frontend      | Next.js 14 (App Router), TypeScript, Tailwind |
| UI            | Shadcn-style components, Framer Motion        |
| Backend       | Next.js API Routes + Server Actions           |
| Banco / Auth  | Supabase (PostgreSQL + Auth + RLS)            |
| IA            | Anthropic Claude API                          |
| Automação     | n8n (preparado para integrações futuras)      |

---

## 🚀 Começando

```bash
# 1. Instalar dependências
npm install

# 2. Configurar ambiente
cp .env.example .env.local
#    preencha as chaves do Supabase e da Anthropic

# 3. (Opcional) Subir o banco com a Supabase CLI
supabase db push    # aplica supabase/migrations/*

# 4. Rodar
npm run dev         # http://localhost:3000
```

> **Sem chaves?** O app roda mesmo assim: as telas usam dados de demonstração
> (`src/lib/mock-data.ts`) e as rotas de IA têm _fallback_ determinístico.
> Conecte Supabase + Anthropic para ativar dados reais e a IA.

---

## 🧠 Módulos

**Fase 1 (implementada):** Autenticação, Dashboard, Check-in diário,
Tarefas inteligentes (com planejamento por IA), schema completo + gamificação.

**Fases seguintes (estrutura pronta):** Health Intelligence (Polar),
Personal Finance + Financial Health Score, Investimentos, Work Hub +
Meeting Intelligence, Knowledge Hub, Goals + Weekly Review.

Veja o roadmap completo em [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## 📁 Estrutura

```
src/
  app/
    (app)/            # rotas autenticadas com shell (sidebar + topbar)
      page.tsx        # Dashboard
      check-in/       # Ritual diário
      tasks/          # Tarefas + planner IA
      assistant/      # Chat com IA
      health|finance|...   # módulos das próximas fases
    api/ai/           # rotas de IA (plan, chat)
    login/            # auth
  components/
    ui/               # primitivos (button, card, badge, progress)
    layout/           # sidebar, topbar, mobile nav
  features/           # lógica por domínio (dashboard, checkin, tasks, assistant)
  lib/
    supabase/         # clients (browser + server)
    ai/               # serviço Claude (claude, planner)
    types.ts          # tipos de domínio
    mock-data.ts      # dados de demonstração (Fase 1)
supabase/
  migrations/         # schema + RLS + scores/gamificação
docs/
  ARCHITECTURE.md
```

---

## 🎮 Gamificação

XP, níveis e sequência de dias incentivam o hábito diário. O XP é registrado em
um **ledger auditável** (`xp_events`); um trigger recalcula nível e total
automaticamente. Ganha-se XP por check-in, tarefas concluídas, treino, estudo e
planejamento.

---

Construído para virar um SaaS: multi-tenant com Row Level Security desde o dia 1.
