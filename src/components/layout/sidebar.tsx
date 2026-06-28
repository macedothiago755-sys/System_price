"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckCircle2,
  ListTodo,
  HeartPulse,
  Wallet,
  TrendingUp,
  Briefcase,
  BookOpen,
  Target,
  Sparkles,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/features/auth/logout-button";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/check-in", label: "Check-in", icon: CheckCircle2 },
  { href: "/tasks", label: "Tarefas", icon: ListTodo },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/health", label: "Saúde", icon: HeartPulse },
  { href: "/finance", label: "Financeiro", icon: Wallet },
  { href: "/investments", label: "Investimentos", icon: TrendingUp },
  { href: "/work", label: "Projetos", icon: Briefcase },
  { href: "/knowledge", label: "Conhecimento", icon: BookOpen },
  { href: "/goals", label: "Metas", icon: Target },
  { href: "/assistant", label: "Assistente IA", icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border/60 bg-card/40 px-3 py-5 backdrop-blur-xl lg:flex">
      <div className="mb-8 flex items-center gap-2 px-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
          T
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">THIAGO OS</p>
          <p className="text-xs text-muted-foreground">Centro de Controle</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-2 border-t border-border/60 pt-2">
        <LogoutButton />
        <p className="px-3 pt-2 text-[10px] text-muted-foreground/60">v0.1</p>
      </div>
    </aside>
  );
}
