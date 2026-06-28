import { askClaude } from "./claude";
import { buildUserContext } from "./context";

export interface WeeklyReviewInput {
  went_well: string;
  went_wrong: string;
  learned: string;
  change: string;
}

const SYSTEM = `Você gera a Weekly Review do THIAGO OS. Com base nas respostas do usuário e
no contexto dele (check-ins, saúde, tarefas, finanças), escreva um relatório
semanal motivador e prático em português do Brasil, com:
1) um parágrafo de síntese,
2) 2-3 pontos fortes,
3) 2-3 ajustes para a próxima semana,
4) uma frase de foco para os próximos 7 dias.
Use markdown enxuto.`;

/** Generate a weekly review report from the user's answers + context. */
export async function generateWeeklyReview(
  input: WeeklyReviewInput
): Promise<string> {
  const context = await buildUserContext();
  const contextBlock = context
    ? `\n\n[Contexto]\n${JSON.stringify(context)}`
    : "";

  return askClaude(
    `Respostas da revisão semanal:
- O que deu certo: ${input.went_well}
- O que deu errado: ${input.went_wrong}
- O que aprendi: ${input.learned}
- O que devo mudar: ${input.change}${contextBlock}`,
    { system: SYSTEM, maxTokens: 900 }
  );
}
