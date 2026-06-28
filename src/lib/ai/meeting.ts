import { askClaudeJSON } from "./claude";
import type { MeetingActionItem } from "@/lib/types";

export interface MeetingAnalysis {
  title: string;
  summary: string;
  decisions: string[];
  action_items: MeetingActionItem[];
}

const SYSTEM = `Você é o Meeting Intelligence do THIAGO OS. Recebe uma ata/transcrição de
reunião e extrai o essencial. Retorne JSON:
{ "title": string curto, "summary": resumo em 2-4 frases,
  "decisions": string[],
  "action_items": [{ "task": string, "owner": string|null, "due": string|null }] }.
Responda em português do Brasil.`;

/** Turn raw meeting minutes into a structured summary. */
export async function analyzeMeeting(raw: string): Promise<MeetingAnalysis> {
  return askClaudeJSON<MeetingAnalysis>(
    `Analise esta ata de reunião:\n\n${raw}`,
    { system: SYSTEM, maxTokens: 1200 }
  );
}
