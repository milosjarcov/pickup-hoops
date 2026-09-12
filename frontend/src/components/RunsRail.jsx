import { useAuth } from "../AuthContext";
import { dayLabel, isSoon, timeLabel } from "../lib/format";
import { InitialsStack, LevelBars, RosterMeter } from "./bits";
import { CourtArc } from "./icons";

function RunCard({ run, court, onSelect, onHover }) {
  const { user } = useAuth();
  const soon = isSoon(run.starts_at);
  // user is null for signed-out visitors, so every check has to tolerate that.
  const joined = run.players.some((p) => p.id === user?.id);
  const full = run.players.length >= run.max_players;

  return (
    <button
      className={`run-card${soon ? " is-live" : ""}`}
      onClick={() => onSelect(court)}
      onMouseEnter={() => onHover(court?.id ?? null)}
      onMouseLeave={() => onHover(null)}
    >
      <span className="run-time">
        <b>{timeLabel(run.starts_at)}</b>
        <span>{dayLabel(run.starts_at)}</span>
      </span>
      <span className="run-main">
        <span className="run-court">{court?.name ?? "Unknown court"}</span>
        <span className="run-meta">
          {soon && <span className="tag live">Starting soon</span>}
          {joined && <span className="tag joined">You’re in</span>}
          {full && !joined && <span className="tag full">Full</span>}
          <span className="tag">
            <LevelBars level={run.skill_level} /> {run.skill_level}
          </span>
        </span>
        <RosterMeter count={run.players.length} max={run.max_players} live={soon} />
        <InitialsStack players={run.players} />
        <p className="run-host">Hosted by {run.host.name}</p>
      </span>
    </button>
  );
}

/**
 * The default left-rail view: every upcoming run in the city, soonest first.
 * This is what a visitor lands on, so the app has content before any click.
 */
export default function RunsRail({ runs, courts, onSelectCourt, onHoverCourt }) {
  const courtsById = new Map(courts.map((c) => [c.id, c]));

  return (
    <>
      <div className="rail-head">
        <span className="label rail-kicker">Upcoming runs</span>
        <div className="rail-title">
          <h1>This week</h1>
          <span className="label mono">
            {runs.length} {runs.length === 1 ? "run" : "runs"}
          </span>
        </div>
        <p className="rail-sub">Pick a run below, or tap a court on the map.</p>
      </div>

      <div className="rail-body">
        {runs.length === 0 ? (
          <div className="empty">
            <CourtArc />
            <strong>Nothing on the schedule</strong>
            <p>Pick a court on the map and post the first run.</p>
          </div>
        ) : (
          runs.map((run) => (
            <RunCard
              key={run.id}
              run={run}
              court={courtsById.get(run.court_id)}
              onSelect={onSelectCourt}
              onHover={onHoverCourt}
            />
          ))
        )}
      </div>
    </>
  );
}
