export const WEEKDAYS = [
  { value: 0, shortLabel: "Sun", label: "Sunday" },
  { value: 1, shortLabel: "Mon", label: "Monday" },
  { value: 2, shortLabel: "Tue", label: "Tuesday" },
  { value: 3, shortLabel: "Wed", label: "Wednesday" },
  { value: 4, shortLabel: "Thu", label: "Thursday" },
  { value: 5, shortLabel: "Fri", label: "Friday" },
  { value: 6, shortLabel: "Sat", label: "Saturday" },
];

export const DEFAULT_BOOKING_AVAILABILITY = [1, 2, 3, 4, 5, 6];

export function normalizeAvailability(days?: number[]) {
  return Array.from(
    new Set(
      (days || DEFAULT_BOOKING_AVAILABILITY).filter(
        (day) => Number.isInteger(day) && day >= 0 && day <= 6
      )
    )
  ).sort((a, b) => a - b);
}

export function formatAvailability(days?: number[]) {
  const normalized = normalizeAvailability(days);
  if (normalized.length === 0) return "No days";
  if (normalized.length === WEEKDAYS.length) return "Every day";

  return normalized
    .map((day) => WEEKDAYS.find((weekday) => weekday.value === day)?.shortLabel)
    .filter(Boolean)
    .join(", ");
}
