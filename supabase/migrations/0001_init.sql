-- ╔══════════════════════════════════════════════════════════════╗
-- ║  THIAGO OS — Initial schema                                    ║
-- ║  Multi-tenant from day 1: every table is scoped by user_id     ║
-- ║  and protected by Row Level Security.                          ║
-- ╚══════════════════════════════════════════════════════════════╝

create extension if not exists "uuid-ossp";

-- ── Enums ────────────────────────────────────────────────────────
create type task_priority as enum ('low', 'medium', 'high', 'urgent');
create type task_status   as enum ('todo', 'in_progress', 'done', 'archived');
create type energy_level  as enum ('low', 'medium', 'high');
create type task_category as enum ('work', 'personal', 'health', 'finance', 'learning');
create type tx_type       as enum ('income', 'expense');
create type goal_category as enum ('finance', 'health', 'career', 'relationship', 'learning');

-- ── Profiles (mirror of auth.users) ──────────────────────────────
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  timezone    text default 'America/Sao_Paulo',
  -- gamification
  xp          integer not null default 0,
  level       integer not null default 1,
  streak_days integer not null default 0,
  last_active date,
  created_at  timestamptz not null default now()
);

-- ── Daily check-ins ──────────────────────────────────────────────
create table daily_checkins (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  date          date not null default current_date,
  energy        integer check (energy between 1 and 10),
  mood          text check (mood in ('great', 'ok', 'bad')),
  sleep_hours   numeric(3,1),
  focus         integer check (focus between 1 and 10),
  main_concern  text,
  win_of_day    text,
  created_at    timestamptz not null default now(),
  unique (user_id, date)
);

-- ── Tasks (anti-procrastination engine) ──────────────────────────
create table tasks (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  parent_id       uuid references tasks(id) on delete cascade, -- subtasks
  title           text not null,
  description     text,
  category        task_category default 'work',
  priority        task_priority default 'medium',
  status          task_status   default 'todo',
  energy_required energy_level  default 'medium',
  estimated_min   integer,
  blocker         text, -- "Por que estou travado?"
  due_date        date,
  completed_at    timestamptz,
  position        integer default 0,
  created_at      timestamptz not null default now()
);

-- ── Calendar events ──────────────────────────────────────────────
create table calendar_events (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  kind        text default 'meeting', -- meeting | focus_block | appointment
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  source      text default 'manual',  -- manual | google
  created_at  timestamptz not null default now()
);

-- ── Health metrics (Polar Flow ready) ────────────────────────────
create table health_metrics (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  date            date not null default current_date,
  sleep_score     integer,
  sleep_duration  numeric(3,1),
  recovery_score  integer,
  heart_rate      integer,
  hrv             integer,
  training_load   integer,
  steps           integer,
  calories        integer,
  source          text default 'manual', -- manual | polar
  created_at      timestamptz not null default now(),
  unique (user_id, date)
);

-- ── Finance ──────────────────────────────────────────────────────
create table financial_transactions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        tx_type not null,
  amount      numeric(14,2) not null,
  category    text not null, -- moradia | alimentacao | transporte | lazer | investimentos | ...
  description text,
  date        date not null default current_date,
  created_at  timestamptz not null default now()
);

create table investments (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  asset_type    text, -- stock | fund | crypto | fixed_income | real_estate
  amount        numeric(14,2) not null default 0,
  yield_pct     numeric(6,2),
  goal          text,
  updated_at    timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

-- ── Work / projects ──────────────────────────────────────────────
create table projects (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  objective   text,
  status      text default 'active', -- active | paused | done
  deadline    date,
  created_at  timestamptz not null default now()
);

-- ── Meeting intelligence ─────────────────────────────────────────
create table meetings (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  project_id   uuid references projects(id) on delete set null,
  title        text,
  raw_notes    text,            -- pasted minutes
  summary      text,            -- AI generated
  decisions    jsonb,           -- AI generated
  action_items jsonb,           -- AI generated
  created_at   timestamptz not null default now()
);

-- ── Knowledge hub ────────────────────────────────────────────────
create table notes (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text,
  content     text,
  kind        text default 'note', -- note | idea | course | document
  tags        text[] default '{}',
  created_at  timestamptz not null default now()
);

-- ── Goals ────────────────────────────────────────────────────────
create table goals (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  category      goal_category not null,
  target_value  numeric,
  current_value numeric default 0,
  unit          text,
  deadline      date,
  status        text default 'active',
  created_at    timestamptz not null default now()
);

-- ── Habits ───────────────────────────────────────────────────────
create table habits (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  cadence     text default 'daily',
  created_at  timestamptz not null default now()
);

create table habit_logs (
  id         uuid primary key default uuid_generate_v4(),
  habit_id   uuid not null references habits(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  date       date not null default current_date,
  done       boolean not null default true,
  unique (habit_id, date)
);

-- ── AI insights (traceable) ──────────────────────────────────────
create table ai_insights (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  source_module text,                       -- health | finance | tasks | review
  title         text,
  body          text not null,
  confidence    numeric(3,2) default 0.7,   -- 0..1
  dismissed     boolean default false,
  created_at    timestamptz not null default now()
);

-- ── Gamification: XP ledger (auditable) ──────────────────────────
create table xp_events (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  reason     text not null, -- checkin | task_done | workout | study | planning
  amount     integer not null,
  created_at timestamptz not null default now()
);

-- ── Helpful indexes ──────────────────────────────────────────────
create index idx_tasks_user_status     on tasks (user_id, status);
create index idx_checkins_user_date    on daily_checkins (user_id, date desc);
create index idx_health_user_date      on health_metrics (user_id, date desc);
create index idx_tx_user_date          on financial_transactions (user_id, date desc);
create index idx_insights_user_created on ai_insights (user_id, created_at desc);

-- ╔══════════════════════════════════════════════════════════════╗
-- ║  Row Level Security — each user sees only their own rows      ║
-- ╚══════════════════════════════════════════════════════════════╝
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','daily_checkins','tasks','calendar_events','health_metrics',
    'financial_transactions','investments','projects','meetings','notes',
    'goals','habits','habit_logs','ai_insights','xp_events'
  ]
  loop
    execute format('alter table %I enable row level security;', t);
  end loop;
end $$;

-- profiles keys on id; everything else on user_id
create policy "own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

do $$
declare t text;
begin
  foreach t in array array[
    'daily_checkins','tasks','calendar_events','health_metrics',
    'financial_transactions','investments','projects','meetings','notes',
    'goals','habits','habit_logs','ai_insights','xp_events'
  ]
  loop
    execute format(
      'create policy "own rows" on %I for all using (auth.uid() = user_id) with check (auth.uid() = user_id);',
      t
    );
  end loop;
end $$;

-- ── Auto-create a profile row when a user signs up ───────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
