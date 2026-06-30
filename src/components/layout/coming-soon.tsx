import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ComingSoon({
  title,
  subtitle,
  phase,
  features,
}: {
  title: string;
  subtitle: string;
  phase: string;
  features: string[];
}) {
  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <Badge variant="outline">{phase}</Badge>
      </div>
      <p className="mb-6 max-w-xl text-muted-foreground">{subtitle}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {features.map((f) => (
          <Card key={f} className="flex items-center gap-3">
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
            <span className="text-sm">{f}</span>
          </Card>
        ))}
      </div>
    </>
  );
}
