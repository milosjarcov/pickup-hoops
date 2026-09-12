export function initials(name) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatStart(iso) {
  const start = new Date(iso);
  const day = new Intl.DateTimeFormat(undefined, { day: "numeric" }).format(start);
  const today = new Intl.DateTimeFormat(undefined, { day: "numeric" }).format(new Date());
  const tomorrow = new Intl.DateTimeFormat(undefined, { day: "numeric" }).format(
    new Date(Date.now() + 864e5),
  );
  const time = start.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const date = start.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const prefix = day === today ? "Today" : day === tomorrow ? "Tomorrow" : date;
  return `${prefix} · ${time}`;
}
