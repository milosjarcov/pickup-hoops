// Small shared derivations so every component labels a run the same way.

export const SKILL_LEVELS = { casual: 1, intermediate: 2, competitive: 3 };

/** "Andre Dubois" -> "AD", for the initials chips. */
export function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function hoursUntil(iso) {
  return (new Date(iso) - Date.now()) / 3_600_000;
}

/** Within the next 3 hours: the app's definition of "happening now-ish". */
export function isSoon(iso) {
  const h = hoursUntil(iso);
  return h >= 0 && h <= 3;
}

/** Calendar-day difference, so 11pm -> 1am tomorrow still reads "Tmrw". */
export function dayLabel(iso) {
  const date = new Date(iso);
  const atMidnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const days = Math.round((atMidnight(date) - atMidnight(new Date())) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Tmrw";
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

export function timeLabel(iso) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function fullWhen(iso) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
