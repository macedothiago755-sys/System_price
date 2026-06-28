import { RoutineView } from "@/features/routine/routine-view";
import { getRoutine } from "@/lib/data";

export default async function RotinaPage() {
  const { blocks } = await getRoutine();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Rotina Semanal</h1>
        <p className="mt-1 text-muted-foreground">
          Sua rotina executável, organizada por dia da semana — sem depender de IA.
        </p>
      </div>
      <RoutineView blocks={blocks} />
    </>
  );
}
