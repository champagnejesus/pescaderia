export function exportToCsv<T extends Record<string, unknown>>(
  data: T[],
  headers: Record<keyof T, string>,
  filename: string,
) {
  const keys = Object.keys(headers) as (keyof T)[];
  const headerRow = keys.map((k) => `"${headers[k]}"`).join(",");
  const rows = data.map((item) =>
    keys.map((k) => {
      const val = item[k];
      const str = val == null ? "" : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    }).join(","),
  );
  const csv = [headerRow, ...rows].join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
