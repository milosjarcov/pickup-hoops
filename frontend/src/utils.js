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
  const today = new Date();
  const tomorrow = new Date(Date.now() + 864e5);
  const day =
    start.toDateString() === today.toDateString()
      ? "Today"
      : start.toDateString() === tomorrow.toDateString()
        ? "Tomorrow"
        : start.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
  const time = start.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return { day, time };
}
