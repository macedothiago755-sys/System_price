import Anthropic from "@anthropic-ai/sdk";
import { askGemini, geminiKey } from "./gemini";

/**
 * Single entry point to the AI layer. Supports two providers, chosen by env:
 *   - Anthropic Claude  (ANTHROPIC_API_KEY)  — paid
 *   - Google Gemini     (GEMINI_API_KEY)     — free tier
 * Anthropic wins if both are set. Modules call these helpers, never an SDK.
 */

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8";

export interface ClaudeOptions {
  system?: string;
  maxTokens?: number;
  temperature?: number;
}

export type AiProvider = "anthropic" | "gemini" | null;

export function aiProvider(): AiProvider {
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (geminiKey()) return "gemini";
  return null;
}

/** True when any AI provider is configured. */
export function aiEnabled(): boolean {
  return aiProvider() !== null;
}

let _client: Anthropic | null = null;
function client() {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

async function askAnthropic(
  prompt: string,
  opts: ClaudeOptions
): Promise<string> {
  const res = await client().messages.create({
    model: MODEL,
    max_tokens: opts.maxTokens ?? 1024,
    temperature: opts.temperature ?? 0.6,
    system: opts.system,
    messages: [{ role: "user", content: prompt }],
  });

  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

/** Low-level: send a prompt, get plain text back (provider-agnostic). */
export async function askClaude(
  prompt: string,
  opts: ClaudeOptions = {}
): Promise<string> {
  const provider = aiProvider();
  if (provider === "gemini") return askGemini(prompt, opts);
  if (provider === "anthropic") return askAnthropic(prompt, opts);
  throw new Error("Nenhum provedor de IA configurado.");
}

/** Ask Claude for strict JSON and parse it. Throws if the response is not valid JSON. */
export async function askClaudeJSON<T>(
  prompt: string,
  opts: ClaudeOptions = {}
): Promise<T> {
  const raw = await askClaude(prompt, {
    ...opts,
    system:
      (opts.system ? opts.system + "\n\n" : "") +
      "Responda APENAS com JSON válido, sem markdown, sem cercas de código.",
  });
  // Strip code fences, then extract the outermost JSON object/array if the
  // model wrapped it in prose — more tolerant than a strict parse.
  let cleaned = raw.replace(/```(?:json)?/gi, "").trim();
  const firstObj = cleaned.indexOf("{");
  const firstArr = cleaned.indexOf("[");
  const start =
    firstArr === -1
      ? firstObj
      : firstObj === -1
        ? firstArr
        : Math.min(firstObj, firstArr);
  if (start > 0) {
    const lastObj = cleaned.lastIndexOf("}");
    const lastArr = cleaned.lastIndexOf("]");
    const end = Math.max(lastObj, lastArr);
    if (end > start) cleaned = cleaned.slice(start, end + 1);
  }
  return JSON.parse(cleaned) as T;
}
