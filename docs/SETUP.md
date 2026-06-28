# THIAGO OS — Guia de Setup & Deploy

Passo a passo para sair do **modo demo** e rodar o THIAGO OS com dados reais
(Supabase + Claude) e publicar na **Vercel**.

> ⏱️ Tempo estimado: ~20–30 min.

---

## 0. Pré-requisitos

- Node.js 18.18+ (recomendado 20+) e npm
- Conta no [Supabase](https://supabase.com)
- Chave da [Anthropic](https://console.anthropic.com) (Claude)
- Conta na [Vercel](https://vercel.com) (para deploy)
- (Opcional) [Supabase CLI](https://supabase.com/docs/guides/cli) para migrations

---

## 1. Clonar e instalar

```bash
git clone https://github.com/macedothiago755-sys/System_price.git
cd System_price
npm install
```

Para rodar já em modo demo (sem nenhuma chave):

```bash
npm run dev   # http://localhost:3000
```

Tudo funciona com dados de exemplo. Os passos abaixo ativam a persistência real.

---

## 2. Criar o projeto no Supabase

1. Acesse https://app.supabase.com → **New project**.
2. Defina nome, senha do banco e região (use uma próxima dos usuários, ex. `South America (São Paulo)`).
3. Aguarde o provisionamento (~2 min).
4. Em **Project Settings → API**, copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ secreta, só no servidor)

---

## 3. Aplicar o schema (migrations)

O schema está em `supabase/migrations/` (`0001_init.sql` e `0002_scores_and_gamification.sql`).

### Opção A — Supabase CLI (recomendado)

```bash
npm i -g supabase
supabase login
supabase link --project-ref <SEU_PROJECT_REF>   # o ref aparece na URL do projeto
supabase db push
```

### Opção B — SQL Editor (sem CLI)

1. No painel do Supabase, vá em **SQL Editor → New query**.
2. Cole o conteúdo de `supabase/migrations/0001_init.sql` e clique **Run**.
3. Repita com `supabase/migrations/0002_scores_and_gamification.sql`.
4. Repita com `supabase/migrations/0003_scheduled_finance.sql` (módulo de Provisões).

> ✅ Ao final você terá 15 tabelas com **Row Level Security** ativa, o trigger de
> criação de perfil (`handle_new_user`), o recálculo de XP e as funções
> `performance_score` / `financial_health_score`.

Confira em **Table Editor** se as tabelas (`profiles`, `tasks`, `daily_checkins`, …) existem.

---

## 4. Configurar autenticação (e-mail + senha)

A autenticação já está **totalmente funcional** (login, cadastro, logout e proteção
de rotas). Usa **e-mail + senha** por padrão.

1. Em **Authentication → Providers → Email**, mantenha habilitado.
2. **Para testar na hora (recomendado):** desligue **"Confirm email"** em
   **Authentication → Providers → Email**. Assim, ao criar a conta você já entra
   direto, sem esperar e-mail de confirmação.
   - Se deixar ligado, o Supabase envia um e-mail de confirmação (pode cair no spam
     e tem limite no plano free).
3. Em **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000` (em produção, a URL da Vercel)
   - **Redirect URLs**: `http://localhost:3000/**` (e depois `https://SEU-APP.vercel.app/**`)

> ℹ️ Com as env vars do Supabase presentes, o middleware **exige login**: rotas
> protegidas redirecionam para `/login`. Sem as env vars, o app roda em modo demo
> aberto. Crie sua conta na tela inicial e comece a inserir seus dados — tudo passa
> a persistir no seu Supabase.

---

## 5. Chave da Anthropic (Claude)

1. Em https://console.anthropic.com → **API Keys → Create key**.
2. Copie a chave (`sk-ant-...`) → `ANTHROPIC_API_KEY`.
3. O modelo padrão é `claude-opus-4-8` (ajustável via `ANTHROPIC_MODEL`).

Sem essa chave, as rotas de IA continuam respondendo em modo de fallback.

---

## 6. Variáveis de ambiente locais

```bash
cp .env.example .env.local
```

Preencha o `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-opus-4-8
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Reinicie o servidor:

```bash
npm run dev
```

Agora check-ins, tarefas, finanças, saúde, metas etc. **persistem no Supabase**, e
o assistente/insights usam seus dados reais.

---

## 7. Deploy na Vercel

1. Acesse https://vercel.com → **Add New… → Project** e importe o repositório
   `macedothiago755-sys/System_price`.
2. Framework: **Next.js** (detectado automaticamente). Build: `next build` (padrão).
3. Em **Environment Variables**, adicione as mesmas chaves do `.env.local`:

   | Variável | Ambiente |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development |
   | `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview (secreta) |
   | `ANTHROPIC_API_KEY` | Production, Preview (secreta) |
   | `ANTHROPIC_MODEL` | Production, Preview |
   | `NEXT_PUBLIC_APP_URL` | `https://SEU-APP.vercel.app` |

4. Clique **Deploy**.
5. Pós-deploy: volte ao Supabase (**Authentication → URL Configuration**) e adicione
   a URL de produção em **Site URL** e **Redirect URLs**
   (`https://SEU-APP.vercel.app/**`).

> 💡 Você também pode usar a integração oficial **Supabase ↔ Vercel** no marketplace
> da Vercel para sincronizar as variáveis automaticamente.

---

## 8. Integrações futuras (Fase 4 — opcional)

- **Google Calendar** (módulo Agenda): criar OAuth no Google Cloud e trocar tokens.
- **Polar Flow** (Health): preencher `POLAR_CLIENT_ID` / `POLAR_CLIENT_SECRET` e
  implementar o webhook de sync (a tabela `health_metrics` já tem `source = 'polar'`).
- **n8n** (automações): apontar `N8N_WEBHOOK_URL` para seu fluxo (ex.: enviar o
  resumo diário por e-mail/WhatsApp, sincronizar dados externos).

---

## 9. Troubleshooting

| Sintoma | Causa provável | Solução |
| --- | --- | --- |
| App mostra dados de exemplo mesmo logado | Env vars do Supabase ausentes/erradas | Confirme `NEXT_PUBLIC_SUPABASE_*` e reinicie |
| `permission denied for table ...` | RLS sem sessão válida | Garanta que o usuário está autenticado; as policies usam `auth.uid()` |
| IA responde "Conecte a ANTHROPIC_API_KEY" | Sem chave da Anthropic | Defina `ANTHROPIC_API_KEY` |
| Magic link não chega | Site/Redirect URLs incorretas | Ajuste em Authentication → URL Configuration |
| Build falha na Vercel | Variável faltando | Confira a tabela de env vars do passo 7 |

---

## 10. Comandos úteis

```bash
npm run dev         # desenvolvimento
npm run build       # build de produção
npm run typecheck   # checagem de tipos
npm run lint        # lint
supabase db push    # aplicar migrations (CLI)
supabase gen types typescript --linked > src/lib/database.types.ts  # tipos do banco
```

Pronto — THIAGO OS rodando com dados reais e IA. 🚀
