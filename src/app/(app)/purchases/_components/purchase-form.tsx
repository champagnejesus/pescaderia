"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/toast";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { createPurchase } from "@/lib/actions/purchases";

type Supplier = { id: string; name: string };
type Product = { id: string; name: string; unit: string };

type Props = {
  suppliers: Supplier[];
  products: Product[];
};

interface LineItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
}

export function PurchaseForm({ suppliers, products }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), productId: "", productName: "", quantity: 0, unitCost: 0 },
  ]);

  function addItem() {
    setItems((prev) => [...prev, { id: crypto.randomUUID(), productId: "", productName: "", quantity: 0, unitCost: 0 }]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateItem(id: string, field: keyof LineItem, value: string | number) {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const updated = { ...i, [field]: value };
        if (field === "productId") {
          const product = products.find((p) => p.id === value);
          updated.productName = product?.name ?? "";
        }
        return updated;
      }),
    );
  }

  const total = items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const validItems = items.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) {
      setError("Agregá al menos un producto con cantidad");
      return;
    }

    setPending(true);
    const form = new FormData(e.currentTarget);
    form.set("items", JSON.stringify(validItems.map((i) => ({ productId: i.productId, quantity: i.quantity, unitCost: i.unitCost }))));

    const result = await createPurchase(form);
    setPending(false);

    if (result.success) {
      toast("success", "Compra registrada correctamente");
      router.push("/purchases");
    } else {
      setError(result.error ?? "Error al guardar");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-2xl bg-[#FF453A]/15 px-4 py-3 text-sm text-[#FF453A] font-medium">{error}</div>
      )}

      <div className="bg-zinc-900 rounded-[28px] p-5 space-y-4 border border-zinc-800">
        <div className="space-y-1.5">
          <label htmlFor="supplierId" className="text-sm font-medium text-zinc-400">Proveedor</label>
          <select
            id="supplierId"
            name="supplierId"
            disabled={pending}
            className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-base text-white transition-colors focus-visible:border-[#5E5CE6] focus-visible:ring-3 focus-visible:ring-[#5E5CE6]/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          >
            <option value="">Sin proveedor</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="invoice" className="text-sm font-medium text-zinc-400">Factura / Remito</label>
          <Input id="invoice" name="invoice" disabled={pending} placeholder="Número de factura (opcional)" className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600" />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="notes" className="text-sm font-medium text-zinc-400">Notas</label>
          <Input id="notes" name="notes" disabled={pending} placeholder="Notas de la compra (opcional)" className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600" />
        </div>
      </div>

      <div className="bg-zinc-900 rounded-[28px] p-5 space-y-3 border border-zinc-800">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Productos</h2>
          <Button type="button" variant="outline" size="sm" onClick={addItem} disabled={pending} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            <Plus className="h-4 w-4 mr-1" /> Agregar
          </Button>
        </div>

        <div className="divide-y divide-zinc-800">
          {items.map((item) => (
            <div key={item.id} className="flex items-end gap-2 py-3 first:pt-0 last:pb-0">
              <div className="flex-1 space-y-1">
                <label className="text-xs text-zinc-500">Producto</label>
                <select
                  value={item.productId}
                  onChange={(e) => updateItem(item.id, "productId", e.target.value)}
                  disabled={pending}
                  className="h-10 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white transition-colors focus-visible:border-[#5E5CE6] focus-visible:ring-3 focus-visible:ring-[#5E5CE6]/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Seleccionar</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                  ))}
                </select>
              </div>
              <div className="w-20 space-y-1">
                <label className="text-xs text-zinc-500">Cant.</label>
                <Input type="number" step="0.1" min="0" value={item.quantity || ""} onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)} disabled={pending} placeholder="0" className="h-10 text-center bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600" />
              </div>
              <div className="w-24 space-y-1">
                <label className="text-xs text-zinc-500">Costo u.</label>
                <Input type="number" step="0.01" min="0" value={item.unitCost || ""} onChange={(e) => updateItem(item.id, "unitCost", parseFloat(e.target.value) || 0)} disabled={pending} placeholder="0.00" className="h-10 text-right bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600" />
              </div>
              <div className="w-20 space-y-1">
                <label className="text-xs text-zinc-500 text-right block">Subtotal</label>
                <p className="h-10 flex items-center justify-end text-sm font-semibold font-mono text-white px-1">${(item.quantity * item.unitCost).toFixed(2)}</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(item.id)} disabled={items.length === 1 || pending} className="mb-0.5 text-zinc-500 hover:text-zinc-300">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-zinc-800">
          <span className="text-sm font-medium text-white">Total</span>
          <span className="text-lg font-bold text-white font-mono">${total.toFixed(2)}</span>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full bg-[#5E5CE6] hover:bg-[#5E5CE6]/80 text-white" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {pending ? "Guardando..." : "Registrar compra"}
      </Button>
    </form>
  );
}
