// Small formatting helpers shared by the court list and the court panel.
// The API sends naive local times ("2026-09-24T19:00:00"), and JS parses
// those as local time, which is what we want for a Montreal-only app.

// The UI copy is English, so dates are too. Using the browser's locale here
// would give you "Today" next to "jeudi" on a French system.
const LOCALE = "en-US";
const timeFmt = new Intl.DateTimeFormat(LOCALE, { hour: "numeric", minute: "2-digit" });
const weekdayFmt = new Intl.DateTimeFormat(LOCALE, { weekday: "long" });
const shortDateFmt = new Intl.DateTimeFormat(LOCALE, { month: "short", day: "numeric" });
const longDateFmt = new Intl.DateTimeFormat(LOCALE, {
  weekday: "long",
  month: "long",
  day: "numeric",
});

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

// Whole calendar days between today and `date`. Rounding absorbs the
// 23 or 25 hour days around daylight saving changes.
function daysFromToday(date) {
  return Math.round((startOfDay(date) - startOfDay(new Date())) / 86_400_000);
}

function relativeDay(date) {
  const diff = daysFromToday(date);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 7) return weekdayFmt.format(date);
  return null;
}

export function formatTime(iso) {
  return timeFmt.format(new Date(iso));
}

// "Today", "Tomorrow", "Saturday", or "Oct 3" further out.
export function relativeDayName(iso) {
  const date = new Date(iso);
  return relativeDay(date) ?? shortDateFmt.format(date);
}

// "Today at 7:00 PM", "Saturday at 6:30 PM", "Oct 3 at 5:00 PM".
export function formatWhen(iso) {
  const date = new Date(iso);
  return `${relativeDay(date) ?? shortDateFmt.format(date)} at ${formatTime(iso)}`;
}

// Runs arrive sorted by start time, so runs on the same day are next to each
// other and one pass is enough to group them.
export function groupByDay(runs) {
  const groups = [];
  for (const run of runs) {
    const date = new Date(run.starts_at);
    const key = startOfDay(date).getTime();
    const last = groups.at(-1);
    if (last?.key === key) {
      last.runs.push(run);
    } else {
      const relative = relativeDay(date);
      groups.push({
        key,
        label: relative ?? longDateFmt.format(date),
        // Relative labels get the full date beside them so "Tuesday" is never ambiguous.
        detail: relative ? longDateFmt.format(date) : null,
        runs: [run],
      });
    }
  }
  return groups;
}

// "YYYY-MM-DD" and "HH:MM" in local time, the formats <input type="date|time"> use.
const pad = (n) => String(n).padStart(2, "0");
export const toDateValue = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const toTimeValue = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export function plural(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// "Milos Jarcov" -> "MJ", "Guest 4821" -> "G". Only words that start with a
// letter count. Array.from splits by character, not UTF-16 unit, so a name
// that starts with an accent or emoji doesn't get cut in half.
export function initials(name) {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter((part) => /^\p{L}/u.test(part))
    .map((part) => Array.from(part)[0]);
  if (letters.length === 0) return "?";
  return (letters[0] + (letters.length > 1 ? letters.at(-1) : "")).toUpperCase();
}

// Every court is in Montreal, so repeating it on each row is noise.
export function shortAddress(address) {
  return address.replace(/,\s*Montreal,\s*QC$/i, "");
}

// Case and accent insensitive, so "pere" finds "Père-Marquette Park".
const fold = (text) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function matchesQuery(court, query) {
  const q = fold(query.trim());
  return q === "" || fold(`${court.name} ${court.address}`).includes(q);
}
