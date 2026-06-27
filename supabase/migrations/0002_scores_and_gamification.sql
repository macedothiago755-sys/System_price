-- ╔══════════════════════════════════════════════════════════════╗
-- ║  THIAGO OS — Scores & gamification logic                       ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ── XP ledger drives level + total XP automatically ──────────────
-- Level curve mirrors the front-end: xpForLevel(l) = round(100 * l^1.5)
create or replace function public.recompute_gamification()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  total_xp integer;
  new_level integer := 1;
begin
  select coalesce(sum(amount), 0) into total_xp
  from xp_events where user_id = new.user_id;

  -- Walk levels until the next threshold exceeds total XP.
  while total_xp >= round(100 * power(new_level + 1, 1.5)) loop
    new_level := new_level + 1;
  end loop;

  update profiles
    set xp = total_xp, level = new_level
    where id = new.user_id;

  return new;
end;
$$;

create trigger trg_xp_recompute
  after insert on xp_events
  for each row execute function public.recompute_gamification();

-- ── Performance Score ────────────────────────────────────────────
-- A single 0–100 number from sleep + recovery + checkin focus/energy.
-- Computed per user/day; the dashboard reads the latest row.
create or replace function public.performance_score(p_user uuid, p_date date)
returns integer
language sql
stable
as $$
  select greatest(0, least(100, round(
      coalesce(h.sleep_score, 70)      * 0.30 +
      coalesce(h.recovery_score, 70)   * 0.25 +
      coalesce(c.focus, 7)  * 10       * 0.25 +
      coalesce(c.energy, 7) * 10       * 0.20
  )))::int
  from (select 1) _
  left join health_metrics  h on h.user_id = p_user and h.date = p_date
  left join daily_checkins  c on c.user_id = p_user and c.date = p_date;
$$;

-- ── Financial Health Score ───────────────────────────────────────
-- Rough 0–100 from savings rate over the trailing 30 days.
create or replace function public.financial_health_score(p_user uuid)
returns integer
language sql
stable
as $$
  with flow as (
    select
      coalesce(sum(amount) filter (where type = 'income'), 0)  as income,
      coalesce(sum(amount) filter (where type = 'expense'), 0) as expense
    from financial_transactions
    where user_id = p_user
      and date >= current_date - interval '30 days'
  )
  select case
    when income = 0 then 0
    else greatest(0, least(100, round((income - expense) / income * 100)))::int
  end
  from flow;
$$;
