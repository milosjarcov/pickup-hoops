import { useState } from "react";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { fullWhen, isSoon } from "../lib/format";
import { InitialsStack, LevelBars, RosterMeter } from "./bits";
import { ChevronLeft, CourtArc } from "./icons";
import RunForm from "./RunForm";

/**
 * One court's runs. Runs are read from the list MapPage already loaded, so
 * joining refreshes the map markers and the rail at the same time.
 */
export default function CourtPanel({ court, runs, onBack, onChanged }) {
  const { user, requireAuth } = useAuth();
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState(null);

  async function act(runId, path, method, token) {
    setError(null);
    setBusyId(runId);
    try {
      await api(path, { method, token });
      await onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="rail-head">
        <button className="rail-back" onClick={onBack}>
          <ChevronLeft /> All runs
        </button>
        <div className="court-head">
          <h2>{court.name}</h2>
          <p className="court-addr">{court.address}</p>
          <span className="label court-coords">
            {court.latitude.toFixed(4)}, {court.longitude.toFixed(4)}
          </span>
        </div>
      </div>

      <div className="rail-body">
        {error && <p className="error">{error}</p>}

        {showForm ? (
          <RunForm
            courtId={court.id}
            onCreated={async () => {
              setShowForm(false);
              await onChanged();
            }}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <button
            className="ghost block"
            onClick={() => requireAuth("Posting a run", () => setShowForm(true))}
          >
            Post a run here
          </button>
        )}

        <div className="section-head">
          <span className="label">Scheduled</span>
          <span className="label mono">{runs.length}</span>
        </div>

        {runs.length === 0 && (
          <div className="empty">
            <CourtArc />
            <strong>No runs yet</strong>
            <p>Be the first to put something on the board here.</p>
          </div>
        )}

        {runs.map((run) => {
          const soon = isSoon(run.starts_at);
          const joined = run.players.some((p) => p.id === user?.id);
          const isHost = run.host.id === user?.id;
          const full = run.players.length >= run.max_players;
          const busy = busyId === run.id;

          return (
            <div className={`detail-card${soon ? " is-live" : ""}`} key={run.id}>
              <div className="detail-top">
                <span className="detail-when">{fullWhen(run.starts_at)}</span>
                {soon && <span className="tag live">Soon</span>}
              </div>

              <div className="run-meta">
                <span className="tag">
                  <LevelBars level={run.skill_level} /> {run.skill_level}
                </span>
                {isHost && <span className="tag host">You host</span>}
                {joined && !isHost && <span className="tag joined">You’re in</span>}
              </div>

              <RosterMeter count={run.players.length} max={run.max_players} live={soon} />
              <InitialsStack players={run.players} limit={8} />
              <p className="detail-players">{run.players.map((p) => p.name).join(" · ")}</p>

              <div className="run-actions">
                {isHost ? (
                  <button
                    className="danger"
                    disabled={busy}
                    onClick={() =>
                      requireAuth("Cancelling a run", (t) =>
                        act(run.id, `/runs/${run.id}`, "DELETE", t),
                      )
                    }
                  >
                    {busy ? "Cancelling…" : "Cancel run"}
                  </button>
                ) : joined ? (
                  <button
                    className="ghost"
                    disabled={busy}
                    onClick={() =>
                      requireAuth("Leaving a run", (t) =>
                        act(run.id, `/runs/${run.id}/leave`, "POST", t),
                      )
                    }
                  >
                    {busy ? "Leaving…" : "Leave"}
                  </button>
                ) : (
                  <button
                    disabled={full || busy}
                    onClick={() =>
                      requireAuth("Joining a run", (t) =>
                        act(run.id, `/runs/${run.id}/join`, "POST", t),
                      )
                    }
                  >
                    {full ? "Full" : busy ? "Joining…" : "Join this run"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
