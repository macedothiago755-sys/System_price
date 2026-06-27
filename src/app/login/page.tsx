"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  // Phase 1: wire to Supabase Auth magic link.
  // const supabase = createClient();
  // await supabase.auth.signInWithOtp({ email });
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
            T
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">THIAGO OS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Seu centro de controle da vida.
          </p>
        </div>

        <div className="surface p-6">
          {sent ? (
            <div className="text-center">
              <Sparkles className="mx-auto mb-3 h-6 w-6 text-primary" />
              <p className="font-medium">Verifique seu e-mail</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Enviamos um link mágico para <strong>{email}</strong>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="block text-sm font-medium">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
              <Button type="submit" size="lg" className="w-full">
                Entrar com link mágico
              </Button>
              <p className="pt-1 text-center text-xs text-muted-foreground">
                Autenticação via Supabase Auth
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
