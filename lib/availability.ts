export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function normalizeAvailableDates(dates?: string[]) {
  return Array.from(
    new Set(
      (dates || []).filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date))
    )
  ).sort();
}
