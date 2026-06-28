"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  const router = useRouter();
  const configured = isSupabaseConfigured();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Demo mode: no backend, just enter the app with example data.
    if (!configured) {
      router.push("/");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      setLoading(false);
      if (error) return setError(error.message);
      // If email confirmation is OFF, a session is created immediately.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.push("/");
        router.refresh();
      } else {
        setMessage(
          "Conta criada! Verifique seu e-mail para confirmar e depois faça login."
        );
        setMode("login");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) return setError(error.message);
      router.push("/");
      router.refresh();
    }
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
          {!configured && (
            <p className="mb-4 rounded-lg border border-warning/20 bg-warning/10 p-3 text-xs text-warning">
              Modo demo: Supabase não configurado. Você pode entrar e explorar com
              dados de exemplo. Configure o <code>.env.local</code> para salvar
              dados reais.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && configured && (
              <div>
                <label className="mb-1 block text-sm font-medium">Nome</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium">E-mail</label>
              <input
                type="email"
                required={configured}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            {configured && (
              <div>
                <label className="mb-1 block text-sm font-medium">Senha</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
            {message && <p className="text-sm text-primary">{message}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {!configured
                ? "Entrar no modo demo"
                : mode === "login"
                  ? "Entrar"
                  : "Criar conta"}
            </Button>
          </form>

          {configured && (
            <button
              onClick={() => {
                setMode((m) => (m === "login" ? "signup" : "login"));
                setError(null);
                setMessage(null);
              }}
              className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              {mode === "login"
                ? "Não tem conta? Criar uma agora"
                : "Já tem conta? Fazer login"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
