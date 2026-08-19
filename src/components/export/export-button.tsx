"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { exportToCsv } from "@/lib/export-csv";

type Column<T> = { key: keyof T; label: string };

type Props<T extends Record<string, unknown>> = {
  fetchData: () => Promise<T[]>;
  columns: Column<T>[];
  filename: string;
  label?: string;
};

export function ExportButton<T extends Record<string, unknown>>({
  fetchData,
  columns,
  filename,
  label = "Exportar CSV",
}: Props<T>) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const data = await fetchData();
      const headers = Object.fromEntries(
        columns.map((c) => [c.key, c.label]),
      ) as Record<keyof T, string>;
      exportToCsv(data, headers, filename);
    } catch {
      // Silently fail – user can retry
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={loading}
      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-1" />
      )}
      {label}
    </Button>
  );
}
