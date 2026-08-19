"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/toast";

type Props = {
  action: (prev: unknown, data: FormData) => Promise<{ success: boolean; error?: string }>;
  defaultValues?: {
    name?: string;
    contact?: string | null;
    phone?: string | null;
    notes?: string | null;
  };
};

export function SupplierForm({ action, defaultValues }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.success) {
      toast("success", "Proveedor guardado correctamente");
      router.push("/suppliers");
    }
  }, [state, router, toast]);

  const error = state && "error" in state ? state.error : undefined;

  return (
    <form action={formAction} className="space-y-4">
      {error && (
        <div className="rounded-2xl bg-[#FF453A]/15 px-4 py-3 text-sm text-[#FF453A] font-medium">{error}</div>
      )}

      <div className="bg-zinc-900 rounded-[28px] p-5 space-y-4 border border-zinc-800">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium text-zinc-400">Nombre *</label>
          <Input id="name" name="name" required defaultValue={defaultValues?.name} disabled={pending} placeholder="Nombre del proveedor" className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="contact" className="text-sm font-medium text-zinc-400">Persona de contacto</label>
          <Input id="contact" name="contact" defaultValue={defaultValues?.contact ?? ""} disabled={pending} placeholder="Nombre del contacto" className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-sm font-medium text-zinc-400">Teléfono</label>
          <Input id="phone" name="phone" defaultValue={defaultValues?.phone ?? ""} disabled={pending} placeholder="11 1234-5678" className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="notes" className="text-sm font-medium text-zinc-400">Notas</label>
          <textarea id="notes" name="notes" rows={3} defaultValue={defaultValues?.notes ?? ""} disabled={pending} className="h-auto w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-base text-white transition-colors focus-visible:border-[#5E5CE6] focus-visible:ring-3 focus-visible:ring-[#5E5CE6]/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none placeholder:text-zinc-600" placeholder="Ej: entre los lunes" />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" size="lg" className="flex-1 bg-[#5E5CE6] hover:bg-[#5E5CE6]/80 text-white" disabled={pending}>
          {pending ? "Guardando..." : "Guardar"}
        </Button>
        <Button type="button" variant="outline" size="lg" className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800" onClick={() => router.back()} disabled={pending}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
