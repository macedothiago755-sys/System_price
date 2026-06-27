import Anthropic from "@anthropic-ai/sdk";

/**
 * Single entry point to the Anthropic Claude API.
 * Modules should NOT instantiate Anthropic directly — they call the typed
 * helpers in `lib/ai/*` so prompts, model and context-building stay centralized.
 */

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8";

let _client: Anthropic | null = null;
function client() {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export interface ClaudeOptions {
  system?: string;
  maxTokens?: number;
  temperature?: number;
}

/** Low-level: send a prompt, get plain text back. */
export async function askClaude(
  prompt: string,
  opts: ClaudeOptions = {}
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
  const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned) as T;
}
