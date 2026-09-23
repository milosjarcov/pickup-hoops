import { useState } from "react";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { capitalize, formatTime, groupByDay, plural, relativeDayName } from "../lib/format";
import AuthPrompt from "./AuthPrompt";
import { AvatarStack } from "./Avatar";
import CapacityRing from "./CapacityRing";
import ConfirmDialog from "./ConfirmDialog";
import { CheckIcon, ChevronLeftIcon, DirectionsIcon, PlusIcon } from "./Icons";
import RunForm from "./RunForm";

function directionsUrl(court) {
  return `https://www.google.com/maps/dir/?api=1&destination=${court.latitude},${court.longitude}`;
}

// What the auth prompt says, depending on what you were trying to do.
const PROMPTS = {
  join: { title: "Join this run", message: "Sign in so the host knows who's coming." },
  post: { title: "Post a run", message: "Sign in so players know who's hosting." },
};

// Three quick facts under the court name, like the info row on an Apple Maps
// place card.
function CourtStats({ runs }) {
  const players = runs.reduce((sum, run) => sum + run.players.length, 0);
  const next = runs[0];
  return (
    <dl className="court-stats">
      <div>
        <dt>Runs</dt>
        <dd>{runs.length}</dd>
        <dd className="court-stats-sub">upcoming</dd>
      </div>
      <div>
        <dt>Players</dt>
        <dd>{players}</dd>
        <dd className="court-stats-sub">signed up</dd>
      </div>
      <div>
        <dt>Next Run</dt>
        <dd>{next ? formatTime(next.starts_at) : "None"}</dd>
        <dd className="court-stats-sub">{next ? relativeDayName(next.starts_at) : "yet"}</dd>
      </div>
    </dl>
  );
}

function RunRow({ run, userId, busy, onJoin, onLeave, onCancel }) {
  const isHost = run.host.id === userId;
  const joined = run.players.some((p) => p.id === userId);
  const count = run.players.length;
  const spotsLeft = run.max_players - count;

  let action;
  if (isHost) {
    action = (
      <button type="button" className="capsule is-destructive" disabled={busy} onClick={onCancel}>
        Cancel
      </button>
    );
  } else if (joined) {
    action = (
      <button type="button" className="capsule" disabled={busy} onClick={onLeave}>
        Leave
      </button>
    );
  } else {
    action = (
      <button type="button" className="capsule is-primary" disabled={busy || spotsLeft <= 0} onClick={onJoin}>
        {spotsLeft <= 0 ? "Full" : "Join"}
      </button>
    );
  }

  let status = null;
  if (isHost) status = <span className="run-status">Hosting</span>;
  else if (joined)
    status = (
      <span className="run-status is-going">
        <CheckIcon /> Going
      </span>
    );

  const names = run.players.map((p) => p.name).join(", ");

  return (
    <li className="run">
      <CapacityRing count={count} max={run.max_players} />
      <div className="run-main">
        <p className="run-time">
          {formatTime(run.starts_at)}
          {status}
        </p>
        <p className="run-meta">
          {capitalize(run.skill_level)} · {spotsLeft > 0 ? `${plural(spotsLeft, "spot")} left` : "Full"}
        </p>
        <div className="run-people" title={names}>
          <AvatarStack people={run.players} />
          <span className="run-count">Hosted by {isHost ? "you" : run.host.name}</span>
        </div>
        <p className="run-names">{names}</p>
      </div>
      <div className="run-action">{action}</div>
    </li>
  );
}

// The sidebar's detail view for one court: its address, actions, and the
// upcoming runs grouped by day. `runs` comes from MapPage, which owns the
// run list for every court, so a change here also updates the court list.
//
// Anyone can look. Joining or posting needs an account, and if you don't
// have one yet, withAuth() asks first and then carries on where you left off.
export default function CourtPanel({ court, runs, onBack, onRunsChanged, onToast }) {
  const { token, user } = useAuth();
  const [error, setError] = useState(null);
  const [busyRunId, setBusyRunId] = useState(null);
  const [composing, setComposing] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(null);
  const [authPrompt, setAuthPrompt] = useState(null);

  function withAuth(reason, action) {
    if (token) return action(token);
    setAuthPrompt({ ...PROMPTS[reason], action });
  }

  // Join, leave, and cancel all work the same way: call the API, then reload
  // runs. We reload even after an error, because errors like "Run is full"
  // mean our copy of the data is out of date.
  async function act(runId, path, method, authToken, doneMessage) {
    setError(null);
    setBusyRunId(runId);
    let ok = false;
    try {
      await api(path, { method, token: authToken });
      ok = true;
    } catch (err) {
      setError(err.message);
    }
    await onRunsChanged().catch(() => {});
    setBusyRunId(null);
    if (ok) onToast?.(doneMessage);
  }

  async function cancelRun() {
    const run = confirmingCancel;
    await act(run.id, `/runs/${run.id}`, "DELETE", token, "Run cancelled");
    setConfirmingCancel(null);
  }

  return (
    <div className="view view-push">
      <nav className="view-nav">
        <button type="button" className="back-button" onClick={onBack}>
          <ChevronLeftIcon />
          Courts
        </button>
      </nav>

      <div className="view-scroll">
        <header className="court-header">
          <h2 className="court-title">{court.name}</h2>
          <p className="court-full-address">{court.address}</p>
          <div className="court-actions">
            <button type="button" className="btn btn-primary" onClick={() => withAuth("post", () => setComposing(true))}>
              <PlusIcon />
              Post a Run
            </button>
            <a className="btn btn-secondary" href={directionsUrl(court)} target="_blank" rel="noreferrer">
              <DirectionsIcon />
              Directions
            </a>
          </div>
          <CourtStats runs={runs} />
        </header>

        {error && (
          <p className="form-error panel-error" role="alert">
            {error}
          </p>
        )}

        <section className="runs" aria-label="Upcoming runs">
          <h3 className="section-title">Upcoming Runs</h3>
          {runs.length === 0 ? (
            <div className="state state-compact">
              <p>Nothing scheduled here yet.</p>
              <button type="button" className="btn-text" onClick={() => withAuth("post", () => setComposing(true))}>
                Post the first run
              </button>
            </div>
          ) : (
            groupByDay(runs).map((day) => (
              <div className="day" key={day.key}>
                <h4 className="day-label">
                  {day.label}
                  {day.detail && <span>{day.detail}</span>}
                </h4>
                <ul className="run-list">
                  {day.runs.map((run) => (
                    <RunRow
                      key={run.id}
                      run={run}
                      userId={user?.id}
                      busy={busyRunId === run.id}
                      onJoin={() =>
                        withAuth("join", (t) => act(run.id, `/runs/${run.id}/join`, "POST", t, "You're in"))
                      }
                      onLeave={() => act(run.id, `/runs/${run.id}/leave`, "POST", token, "You left the run")}
                      onCancel={() => setConfirmingCancel(run)}
                    />
                  ))}
                </ul>
              </div>
            ))
          )}
        </section>
      </div>

      {composing && (
        <RunForm
          court={court}
          onCancel={() => setComposing(false)}
          onCreated={async () => {
            await onRunsChanged();
            setComposing(false);
            onToast?.("Run posted");
          }}
        />
      )}

      {confirmingCancel && (
        <ConfirmDialog
          title="Cancel this run?"
          message={`Everyone who joined the ${formatTime(confirmingCancel.starts_at)} run will lose their spot.`}
          cancelLabel="Keep Run"
          confirmLabel="Cancel Run"
          busy={busyRunId === confirmingCancel.id}
          onCancel={() => setConfirmingCancel(null)}
          onConfirm={cancelRun}
        />
      )}

      {authPrompt && (
        <AuthPrompt
          title={authPrompt.title}
          message={authPrompt.message}
          returnTo={`/map?court=${court.id}`}
          onAuthed={authPrompt.action}
          onClose={() => setAuthPrompt(null)}
        />
      )}
    </div>
  );
}
