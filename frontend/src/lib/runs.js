// Helpers for the list of upcoming runs the API returns (sorted by start time).

// Split one city-wide list into per-court lists, keeping the time order.
export function groupByCourt(runs) {
  const byCourt = new Map();
  for (const run of runs) {
    if (!byCourt.has(run.court_id)) byCourt.set(run.court_id, []);
    byCourt.get(run.court_id).push(run);
  }
  return byCourt;
}

// The court with the most going on, for showing off on the landing page.
export function busiestCourt(courts, byCourt) {
  let best = null;
  for (const court of courts ?? []) {
    const count = byCourt.get(court.id)?.length ?? 0;
    if (!best || count > best.count) best = { court, count };
  }
  return best?.court ?? null;
}
