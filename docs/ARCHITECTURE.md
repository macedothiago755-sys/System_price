# THIAGO OS — Arquitetura

## 1. Visão

THIAGO OS é um "sistema operacional pessoal": um app de uso diário que combina
produtividade, saúde, finanças e evolução pessoal, com IA no centro. O objetivo
de produto é **retenção diária** — o usuário deve _querer_ abrir todo dia.

A tese central que guia o design: **"organizar a pessoa que executa as tarefas,
não só as tarefas."** Por isso o estado físico/mental (energia, sono,
recuperação, foco) é cidadão de primeira classe e alimenta as recomendações.

## 2. Princípios de arquitetura

1. **Multi-tenant desde o dia 1.** Cada tabela é escopada por `user_id` e
   protegida por **Row Level Security** no Postgres. Migrar para SaaS depois não
   exige refatorar o modelo de dados.
2. **Domínio por feature, não por tipo.** `src/features/<domínio>` agrupa UI +
   lógica de cada módulo. Escala melhor que pastas globais de `components/hooks`.
3. **IA como serviço isolado.** Tudo passa por `src/lib/ai/`. Os módulos chamam
   funções tipadas (`planTasks`, `breakdownTask`, `askClaude`) — nunca a SDK
   direto. Prompts, modelo e construção de contexto ficam num único lugar.
4. **Cálculos pesados no banco.** Performance Score, Financial Health Score e a
   progressão de XP são funções/triggers SQL → consistência e cache naturais.
5. **Degradação graciosa.** Sem chaves de Supabase/Anthropic, o app roda com
   mock data e _fallbacks_ determinísticos. Onboarding e demo sem fricção.

## 3. Camadas

```
┌────────────────────────────────────────────┐
│ app/  (App Router) — rotas, layouts, RSC    │
├────────────────────────────────────────────┤
│ features/ — lógica de domínio + UI por módulo│
├────────────────────────────────────────────┤
│ lib/ — infra: supabase, ai (Claude), utils  │
├────────────────────────────────────────────┤
│ supabase/ — schema, RLS, funções, triggers  │
└────────────────────────────────────────────┘
```

- **Server Components** carregam dados (Supabase server client + cookies).
- **Client Components** (`features/*`) cuidam de interação e animação.
- **API Routes** (`app/api/ai/*`) encapsulam chamadas à IA; em Server Actions
  futuras, as mutações de dados ficam co-localizadas com as features.

## 4. Modelo de dados

15 tabelas (ver `supabase/migrations/0001_init.sql`):

`profiles`, `daily_checkins`, `tasks` (com `parent_id` p/ subtarefas),
`calendar_events`, `health_metrics`, `financial_transactions`, `investments`,
`projects`, `meetings`, `notes`, `goals`, `habits`, `habit_logs`,
`ai_insights`, `xp_events`.

### Decisões notáveis (melhorias sobre o brief)

- **`xp_events` (ledger) em vez de um contador.** Auditável e recalculável; um
  trigger deriva `xp` e `level` em `profiles`.
- **`ai_insights.source_module` + `confidence`.** Rastreabilidade: de qual
  módulo/dado veio cada insight e quão confiável ele é.
- **Scores como funções SQL.** `performance_score(user, date)` e
  `financial_health_score(user)` — calculados onde os dados vivem.
- **Enums fortes** (`task_priority`, `energy_level`, etc.) garantem integridade.
- **`tasks.parent_id`** habilita a quebra de tarefas grandes (anti-procrastinação)
  como hierarquia real, não texto solto.

## 5. Integração com IA (Claude)

`lib/ai/claude.ts` expõe `askClaude` (texto) e `askClaudeJSON<T>` (JSON estrito).
Sobre eles, serviços de domínio:

- `planner.planTasks(brainDump)` → tarefas estruturadas e priorizadas.
- `planner.breakdownTask(title)` → subtarefas acionáveis.
- `/api/ai/chat` → assistente que recebe contexto do usuário.

**Próximo passo:** um _context builder_ que monta um snapshot do usuário
(últimos check-ins, métricas de saúde, tarefas abertas, finanças) e injeta nos
prompts — é o que torna o assistente "pessoal" de verdade.

## 6. Segurança

- RLS em todas as tabelas; políticas `auth.uid() = user_id`.
- `SUPABASE_SERVICE_ROLE_KEY` e `ANTHROPIC_API_KEY` são **server-only**.
- Chamadas de IA nunca acontecem no cliente — sempre via API Routes.
- Trigger `handle_new_user` cria o `profile` no signup (idempotente).

## 7. Roadmap (fases do brief)

| Fase | Entregas |
| ---- | -------- |
| **1** ✅ | Auth, Dashboard, Check-in, Tarefas, banco + gamificação |
| **2** | Context builder de IA, planejamento avançado, insights, Goals/Weekly Review, Work Hub + Meeting Intelligence, Knowledge Hub |
| **3** | Financeiro + Financial Health Score + simulador, Investimentos, Health Intelligence + Polar Flow, Performance Score na UI |
| **4** | Google Calendar, automações n8n, notificações/lembretes |

## 8. Decisões pendentes / sugestões futuras

- **Realtime** (Supabase Realtime) para o dashboard refletir mudanças na hora.
- **Edge caching** de scores diários via tabela materializada.
- **Push/PWA** para lembrete do check-in matinal — chave para o hábito.
- **Embeddings** (pgvector) para a busca semântica do Knowledge Hub.
- **n8n** para sincronizar Polar Flow e enviar resumos diários por e-mail/WhatsApp.
