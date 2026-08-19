"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/toast";

interface ProductFormData {
  name: string;
  unit: "kg" | "unidad" | "docena";
  salePrice: number;
  costPrice?: number;
  minStock?: number;
}

type Props = {
  action: (prev: unknown, data: FormData) => Promise<{ success: boolean; error?: string }>;
  defaultValues?: Partial<ProductFormData>;
};

export function ProductForm({ action, defaultValues }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.success) {
      toast("success", "Producto guardado correctamente");
      router.push("/products");
    }
  }, [state, router, toast]);

  const error = state && "error" in state ? state.error : undefined;

  return (
    <form action={formAction} className="space-y-4">
      {error && (
        <div className="rounded-2xl bg-[#FF453A]/15 px-4 py-3 text-sm text-[#FF453A] font-medium">
          {error}
        </div>
      )}

      <div className="bg-zinc-900 rounded-[28px] p-5 space-y-4 border border-zinc-800">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium text-zinc-400">Nombre del producto</label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={defaultValues?.name}
            disabled={pending}
            placeholder="Ej: Merluza fresca"
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="unit" className="text-sm font-medium text-zinc-400">Unidad</label>
          <select
            id="unit"
            name="unit"
            required
            defaultValue={defaultValues?.unit ?? "kg"}
            disabled={pending}
            className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-base text-white transition-colors focus-visible:border-[#5E5CE6] focus-visible:ring-3 focus-visible:ring-[#5E5CE6]/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          >
            <option value="kg">Kilogramo (kg)</option>
            <option value="unidad">Unidad</option>
            <option value="docena">Docena</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="salePrice" className="text-sm font-medium text-zinc-400">Precio de venta ($)</label>
          <Input
            id="salePrice"
            name="salePrice"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={defaultValues?.salePrice}
            disabled={pending}
            placeholder="0.00"
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="costPrice" className="text-sm font-medium text-zinc-400">Precio de compra ($)</label>
          <Input
            id="costPrice"
            name="costPrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaultValues?.costPrice ?? 0}
            disabled={pending}
            placeholder="0.00"
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="minStock" className="text-sm font-medium text-zinc-400">Stock mínimo (alerta)</label>
          <Input
            id="minStock"
            name="minStock"
            type="number"
            step="0.1"
            min="0"
            defaultValue={defaultValues?.minStock ?? 0}
            disabled={pending}
            placeholder="0"
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          size="lg"
          className="flex-1 bg-[#5E5CE6] hover:bg-[#5E5CE6]/80 text-white"
          disabled={pending}
        >
          {pending ? "Guardando..." : "Guardar"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          onClick={() => router.back()}
          disabled={pending}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
