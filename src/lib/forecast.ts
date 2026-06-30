import type { ScheduledTransaction } from "./types";

export interface MonthProjection {
  key: string; // "2026-07"
  label: string; // "jul/26"
  income: number;
  expense: number;
  net: number;
  accumulated: number;
  pending: number; // count of unpaid entries in the month
}

const pad = (n: number) => String(n).padStart(2, "0");

export function monthKeyOf(dateStr: string): string {
  return dateStr.slice(0, 7); // YYYY-MM
}

function labelOf(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "2-digit",
  })
    .format(d)
    .replace(".", "");
}

/** All month keys from `start` to `end` inclusive (both "YYYY-MM"). */
function monthsBetween(start: string, end: string): string[] {
  const out: string[] = [];
  let [y, m] = start.split("-").map(Number);
  const [ey, em] = end.split("-").map(Number);
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}-${pad(m)}`);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

/**
 * Monthly cash-flow projection from the current month to the furthest due date
 * (or `until`, whichever is later). `startingBalance` seeds the accumulated line.
 */
export function buildProjection(
  entries: ScheduledTransaction[],
  opts: { startingBalance?: number; from?: string; until?: string } = {}
): MonthProjection[] {
  const now = new Date();
  const startKey =
    opts.from && /^\d{4}-\d{2}$/.test(opts.from)
      ? opts.from
      : `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

  const dueKeys = entries.map((e) => monthKeyOf(e.due_date));
  let endKey = opts.until ? monthKeyOf(opts.until) : startKey;
  for (const k of dueKeys) if (k > endKey) endKey = k;
  if (endKey < startKey) endKey = startKey;

  const keys = monthsBetween(startKey, endKey);
  const map = new Map<string, MonthProjection>();
  for (const key of keys) {
    map.set(key, {
      key,
      label: labelOf(key),
      income: 0,
      expense: 0,
      net: 0,
      accumulated: 0,
      pending: 0,
    });
  }

  for (const e of entries) {
    const key = monthKeyOf(e.due_date);
    const bucket = map.get(key);
    if (!bucket) continue; // out of range (past months)
    if (e.type === "income") bucket.income += Number(e.amount);
    else bucket.expense += Number(e.amount);
    if (!e.paid) bucket.pending += 1;
  }

  let acc = opts.startingBalance ?? 0;
  const result: MonthProjection[] = [];
  for (const key of keys) {
    const b = map.get(key)!;
    b.net = b.income - b.expense;
    acc += b.net;
    b.accumulated = acc;
    result.push(b);
  }
  return result;
}

export interface ForecastTotals {
  income: number;
  expense: number;
  net: number;
}

export function forecastTotals(entries: ScheduledTransaction[]): ForecastTotals {
  let income = 0;
  let expense = 0;
  for (const e of entries) {
    if (e.type === "income") income += Number(e.amount);
    else expense += Number(e.amount);
  }
  return { income, expense, net: income - expense };
}
