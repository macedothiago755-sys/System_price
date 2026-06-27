import { AssistantChat } from "@/features/assistant/chat";

export default function AssistantPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Assistente IA</h1>
        <p className="mt-1 text-muted-foreground">
          Seu copiloto pessoal, com acesso aos seus dados.
        </p>
      </div>
      <AssistantChat />
    </>
  );
}
