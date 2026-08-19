"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";

export function UserNav() {
  const { data: session, status } = useSession();
  const router = useRouter();

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push("/login");
  }

  if (status === "loading") {
    return <div className="h-7 w-20 rounded-xl bg-zinc-800 animate-pulse" />;
  }

  if (!session?.user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="sm" className="gap-2 text-zinc-300 hover:text-white hover:bg-zinc-800">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{session.user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700 text-white">
        <DropdownMenuLabel className="text-zinc-400">{session.user.name}</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-700" />
        <DropdownMenuItem onClick={handleLogout} className="text-zinc-300 hover:text-white hover:bg-zinc-700">
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
