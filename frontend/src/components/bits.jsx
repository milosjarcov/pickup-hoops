import { SKILL_LEVELS, initials } from "../lib/format";

/** Three ascending bars, filled to the run's skill level. */
export function LevelBars({ level }) {
  const filled = SKILL_LEVELS[level] ?? 1;
  return (
    <span className="level" aria-hidden="true">
      {[1, 2, 3].map((i) => (
        <i key={i} className={i <= filled ? "on" : ""} />
      ))}
    </span>
  );
}

/** One tick per slot on the roster, so "8/10" is legible at a glance. */
export function RosterMeter({ count, max, live = false }) {
  return (
    <span className="roster">
      <span className="roster-ticks" aria-hidden="true">
        {Array.from({ length: max }, (_, i) => (
          <i key={i} className={i < count ? `on${live ? " live" : ""}` : ""} />
        ))}
      </span>
      <span className="roster-count">
        <b>{count}</b>/{max} in
      </span>
    </span>
  );
}

export function InitialsStack({ players, limit = 6 }) {
  const shown = players.slice(0, limit);
  const rest = players.length - shown.length;
  return (
    <span className="stack">
      {shown.map((p) => (
        <span className="who" key={p.id} title={p.name}>
          {initials(p.name)}
        </span>
      ))}
      {rest > 0 && <span className="who more">+{rest}</span>}
    </span>
  );
}
