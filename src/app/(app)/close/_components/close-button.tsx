"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";
import { closeDay } from "@/lib/actions/daily-close";

type Props = {
  disabled: boolean;
};

export function CloseButton({ disabled }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleClose() {
    if (!confirm("¿Estás seguro de cerrar el día? No se podrá modificar.")) return;

    setPending(true);
    setError("");
    const result = await closeDay();
    setPending(false);

    if (result.success) {
      router.refresh();
    } else {
      setError(result.error ?? "Error al cerrar el día");
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="rounded-2xl bg-[#FF453A]/15 px-4 py-3 text-sm text-[#FF453A] font-medium">{error}</div>
      )}
      <Button
        type="button"
        size="lg"
        className="w-full bg-[#5E5CE6] hover:bg-[#5E5CE6]/80 text-white"
        disabled={disabled || pending}
        onClick={handleClose}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Lock className="h-4 w-4 mr-2" />
        )}
        {pending ? "Cerrando..." : "Cerrar día"}
      </Button>
      {disabled && (
        <p className="text-xs text-zinc-500 text-center">No hay movimientos para cerrar hoy</p>
      )}
    </div>
  );
}
