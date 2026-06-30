import { ProjectsList } from "@/features/work/projects-list";
import { MeetingIntelligence } from "@/features/work/meeting-intelligence";
import { getProjects } from "@/lib/data";

export default async function WorkPage() {
  const { projects } = await getProjects();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Work Hub</h1>
        <p className="mt-1 text-muted-foreground">
          Projetos, decisões e reuniões inteligentes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ProjectsList projects={projects} />
        <MeetingIntelligence />
      </div>
    </>
  );
}
