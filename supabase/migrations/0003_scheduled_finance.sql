-- ╔══════════════════════════════════════════════════════════════╗
-- ║  THIAGO OS — Provisões / fluxo futuro                          ║
-- ║  Parcelas pendentes e recebimentos futuros (com projeção).     ║
-- ╚══════════════════════════════════════════════════════════════╝

create table if not exists scheduled_transactions (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  type             tx_type not null,          -- income | expense
  amount           numeric(14,2) not null,    -- valor por parcela
  category         text,
  description      text,
  due_date         date not null,             -- vencimento
  paid             boolean not null default false,
  group_id         uuid,                       -- agrupa parcelas de um mesmo lançamento
  installment_no   integer,                    -- 1..total
  installment_total integer,
  created_at       timestamptz not null default now()
);

create index if not exists idx_sched_user_due
  on scheduled_transactions (user_id, due_date);

alter table scheduled_transactions enable row level security;

create policy "own rows" on scheduled_transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
