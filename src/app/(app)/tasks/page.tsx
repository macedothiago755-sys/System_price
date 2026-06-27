import { Planner } from "@/features/tasks/planner";
import { TaskBoard } from "@/features/tasks/task-board";

export default function TasksPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Tarefas inteligentes
        </h1>
        <p className="mt-1 text-muted-foreground">
          Organize a pessoa que executa as tarefas, não só as tarefas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Planner />
        <TaskBoard />
      </div>
    </>
  );
}
