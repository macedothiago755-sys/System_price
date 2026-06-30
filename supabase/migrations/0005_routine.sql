-- ╔══════════════════════════════════════════════════════════════╗
-- ║  THIAGO OS — Rotina semanal recorrente                        ║
-- ║  Blocos fixos por dia da semana (sem IA).                     ║
-- ╚══════════════════════════════════════════════════════════════╝

create table if not exists routine_blocks (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  weekday     smallint not null check (weekday between 1 and 7), -- 1=Seg .. 7=Dom
  start_time  text,        -- "HH:MM"
  end_time    text,        -- "HH:MM" ou null
  title       text not null,
  category    text default 'geral',
  notes       text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_routine_user_day
  on routine_blocks (user_id, weekday, start_time);

alter table routine_blocks enable row level security;

create policy "own rows" on routine_blocks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
