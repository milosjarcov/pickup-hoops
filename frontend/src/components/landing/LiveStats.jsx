import { useEffect, useRef, useState } from "react";
import { useInView } from "../../hooks/useInView";

// Counts up to `value` the first time it scrolls into view, easing out so
// it slows down as it lands. If the value changes later (the API answered
// after you scrolled here), it counts on from wherever it was.
function CountUp({ value }) {
  const ref = useRef(null);
  const visible = useInView(ref);
  const [shown, setShown] = useState(0);
  const shownRef = useRef(0);

  useEffect(() => {
    if (!visible) return;
    const from = shownRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduceMotion ? 0 : 1400;
    const start = performance.now();
    let frame;
    function tick(now) {
      const t = duration ? Math.min(1, (now - start) / duration) : 1;
      const eased = 1 - (1 - t) ** 3;
      shownRef.current = Math.round(from + (value - from) * eased);
      setShown(shownRef.current);
      if (t < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, value]);

  return <span ref={ref}>{shown}</span>;
}

// Real numbers from the API, fetched when the page loaded. They move as
// people join and post runs, which is the point: this isn't a mockup.
export default function LiveStats({ courts, runs }) {
  const weekFromNow = Date.now() + 7 * 86_400_000;
  const stats = [
    { value: courts?.length ?? 0, label: "courts on the map" },
    { value: runs.filter((r) => new Date(r.starts_at) <= weekFromNow).length, label: "runs in the next seven days" },
    { value: runs.reduce((sum, r) => sum + r.players.length, 0), label: "players signed up" },
    {
      value: runs.reduce((sum, r) => sum + Math.max(0, r.max_players - r.players.length), 0),
      label: "open spots right now",
    },
  ];

  return (
    <section className="stats" aria-labelledby="stats-title">
      <h2 id="stats-title" data-reveal>
        Happening this week.
      </h2>
      <p className="stats-sub" data-reveal>
        Pulled from the live API when this page loaded.
      </p>
      <dl className="stats-grid">
        {stats.map((stat) => (
          // Label first for screen readers; CSS flips them so the number sits on top.
          <div className="stat" key={stat.label} data-reveal>
            <dt className="stat-label">{stat.label}</dt>
            <dd className="stat-value">
              <CountUp value={stat.value} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
