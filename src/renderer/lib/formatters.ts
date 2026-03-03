export function formatRub(value: number) {
  return `${new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0
  }).format(value)} ₽`;
}

export function formatDateRu(isoDate: string) {
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return isoDate;
  return `${d}.${m}.${y}`;
}

export function getTodayIsoDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}