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

export function formatIsoDateToRuInput(isoDate: string) {
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return "";
  return `${d}.${m}.${y}`;
}

export function parseRuDateToIso(ruDate: string) {
  const match = ruDate.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return null;

  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);

  const date = new Date(Date.UTC(year, month - 1, day));
  const isValid =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  if (!isValid) return null;
  return `${yyyy}-${mm}-${dd}`;
}

export function getTodayRuDate() {
  return formatIsoDateToRuInput(getTodayIsoDate());
}
