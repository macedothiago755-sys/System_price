import { GoalsBoard } from "@/features/goals/goals-board";
import { GoalForm } from "@/features/goals/goal-form";
import { WeeklyReview } from "@/features/goals/weekly-review";
import { getGoals } from "@/lib/data";

export default async function GoalsPage() {
  const { goals } = await getGoals();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Goals Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Progresso, histórico e revisão semanal — por categoria.
        </p>
      </div>

      <GoalsBoard goals={goals} />

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <GoalForm />
        <WeeklyReview />
      </div>
    </>
  );
}
