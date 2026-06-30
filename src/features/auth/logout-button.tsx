"use client";

import { LogOut } from "lucide-react";
import { signOut } from "./actions";

export function LogoutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
        Sair
      </button>
    </form>
  );
}
