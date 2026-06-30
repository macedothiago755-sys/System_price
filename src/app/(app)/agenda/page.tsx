import { Agenda } from "@/features/agenda/agenda";
import { getEvents } from "@/lib/data";

export default async function AgendaPage() {
  const { events } = await getEvents();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Agenda</h1>
        <p className="mt-1 text-muted-foreground">
          Reuniões, compromissos e blocos de foco em um só lugar.
        </p>
      </div>
      <Agenda events={events} />
    </>
  );
}
