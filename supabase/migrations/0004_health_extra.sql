-- ╔══════════════════════════════════════════════════════════════╗
-- ║  THIAGO OS — Métricas extras de saúde (Polar)                  ║
-- ║  Status cardiovascular, esforço×tolerância e treino.          ║
-- ╚══════════════════════════════════════════════════════════════╝

alter table health_metrics
  add column if not exists cardio_status   text,     -- ex: Produtivo, Mantendo...
  add column if not exists strain          numeric,  -- esforço (cardio load)
  add column if not exists tolerance       numeric,  -- tolerância (cardio load)
  add column if not exists workout_sport   text,     -- modalidade do treino
  add column if not exists workout_minutes integer;  -- duração do treino (min)
