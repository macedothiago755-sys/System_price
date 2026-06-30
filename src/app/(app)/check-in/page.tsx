import { CheckinForm } from "@/features/checkin/checkin-form";
import { CheckinHistory } from "@/features/checkin/checkin-history";
import { getCheckins } from "@/lib/data";

export default async function CheckinPage() {
  const { today, history } = await getCheckins();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Check-in diário</h1>
        <p className="mt-1 text-muted-foreground">
          Seu ritual de abertura. Leva menos de um minuto.
        </p>
      </div>
      <CheckinForm initial={today} />
      <CheckinHistory history={history} />
    </div>
  );
}
