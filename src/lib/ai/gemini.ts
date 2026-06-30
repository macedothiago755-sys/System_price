import type { ClaudeOptions } from "./claude";

/**
 * Google Gemini provider (free tier via Google AI Studio).
 * Uses the REST API directly — no SDK dependency.
 * Get a free key at https://aistudio.google.com/app/apikey
 */

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

export function geminiKey(): string | undefined {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
}

export async function askGemini(
  prompt: string,
  opts: ClaudeOptions = {}
): Promise<string> {
  const key = geminiKey();
  if (!key) throw new Error("GEMINI_API_KEY ausente.");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: opts.maxTokens ?? 1024,
      temperature: opts.temperature ?? 0.6,
    },
  };
  if (opts.system) {
    body.system_instruction = { parts: [{ text: opts.system }] };
  }

  const res = await fetch(url, {
    method: "POST",
    // Header auth works for all AI Studio key formats (AIza… and the newer AQ.…).
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Gemini ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  const candidate = data?.candidates?.[0];
  const parts = candidate?.content?.parts ?? [];
  const text = parts
    .map((p: { text?: string }) => p.text ?? "")
    .join("")
    .trim();

  if (!text) {
    const reason = candidate?.finishReason ?? data?.promptFeedback?.blockReason;
    throw new Error(`Gemini retornou vazio${reason ? ` (${reason})` : ""}.`);
  }
  return text;
}
