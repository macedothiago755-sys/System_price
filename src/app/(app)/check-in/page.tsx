import { CheckinForm } from "@/features/checkin/checkin-form";

export default function CheckinPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Check-in diário</h1>
        <p className="mt-1 text-muted-foreground">
          Seu ritual de abertura. Leva menos de um minuto.
        </p>
      </div>
      <CheckinForm />
    </div>
  );
}
