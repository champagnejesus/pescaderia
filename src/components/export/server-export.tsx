import { ExportButton } from "./export-button";

type Column<T extends Record<string, unknown>> = { key: keyof T; label: string };

type Props<T extends Record<string, unknown>> = {
  fetchData: () => Promise<T[]>;
  columns: Column<T>[];
  filename: string;
  label?: string;
};

export async function ServerExportButton<T extends Record<string, unknown>>({
  fetchData,
  columns,
  filename,
  label,
}: Props<T>) {
  return (
    <ExportButton
      fetchData={fetchData}
      columns={columns}
      filename={filename}
      label={label}
    />
  );
}
