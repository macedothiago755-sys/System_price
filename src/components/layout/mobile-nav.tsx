"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckCircle2,
  ListTodo,
  HeartPulse,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Hoje", icon: LayoutDashboard },
  { href: "/check-in", label: "Check-in", icon: CheckCircle2 },
  { href: "/tasks", label: "Tarefas", icon: ListTodo },
  { href: "/health", label: "Saúde", icon: HeartPulse },
  { href: "/assistant", label: "IA", icon: Sparkles },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-border/60 bg-card/80 px-2 py-2 backdrop-blur-xl lg:hidden">
      {items.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[10px]",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
