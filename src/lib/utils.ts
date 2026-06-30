import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Friendly greeting based on the local hour. */
export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

/** Capitalized long-form date in pt-BR, e.g. "sexta-feira, 27 de junho". */
export function formatLongDate(date = new Date()): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/** Clamp a number between min and max. */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/**
 * Performance Score (0–100) — mirrors the SQL `performance_score` function so
 * the UI and DB agree. Blends sleep, recovery, focus and energy.
 */
export function performanceScore(args: {
  sleep_score?: number | null;
  recovery_score?: number | null;
  focus?: number | null;
  energy?: number | null;
}): number {
  const sleep = args.sleep_score ?? 70;
  const recovery = args.recovery_score ?? 70;
  const focus = (args.focus ?? 7) * 10;
  const energy = (args.energy ?? 7) * 10;
  return Math.round(
    clamp(sleep * 0.3 + recovery * 0.25 + focus * 0.25 + energy * 0.2, 0, 100)
  );
}
