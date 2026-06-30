import { AssistantChat } from "@/features/assistant/chat";
import { aiProvider } from "@/lib/ai/claude";
import { Badge } from "@/components/ui/badge";

const providerLabel = {
  gemini: "Gemini (Google)",
  anthropic: "Claude (Anthropic)",
} as const;

export default function AssistantPage() {
  const provider = aiProvider();

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Assistente IA</h1>
          <p className="mt-1 text-muted-foreground">
            Seu copiloto pessoal, com acesso aos seus dados.
          </p>
        </div>
        {provider ? (
          <Badge variant="primary">IA ativa · {providerLabel[provider]}</Badge>
        ) : (
          <Badge variant="warning">IA não configurada</Badge>
        )}
      </div>
      <AssistantChat />
    </>
  );
}
