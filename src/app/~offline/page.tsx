export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-[#121212]">
      <h1 className="text-2xl font-bold text-white">Sin conexión</h1>
      <p className="mt-2 text-zinc-500">
        No tenés internet. Revisá los pedidos ya guardados.
      </p>
    </div>
  );
}
