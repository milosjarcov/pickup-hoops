import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import RunForm from "./RunForm";

function formatStart(iso) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function CourtPanel({ court, onClose }) {
  const { token, user } = useAuth();
  const [runs, setRuns] = useState([]);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const refresh = useCallback(() => {
    api(`/runs?court_id=${court.id}`)
      .then(setRuns)
      .catch((err) => setError(err.message));
  }, [court.id]);

  // Reload runs whenever a different court is selected.
  useEffect(() => {
    setRuns([]);
    setError(null);
    setShowForm(false);
    refresh();
  }, [refresh]);

  async function call(path, method) {
    setError(null);
    try {
      await api(path, { method, token });
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <aside className="panel">
      <div className="panel-header">
        <div>
          <h2>{court.name}</h2>
          <p className="muted">{court.address}</p>
        </div>
        <button className="link-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {showForm ? (
        <RunForm
          courtId={court.id}
          onCreated={() => {
            setShowForm(false);
            refresh();
          }}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <button onClick={() => setShowForm(true)}>+ Post a run</button>
      )}

      <h3>Upcoming runs</h3>
      {runs.length === 0 && <p className="muted">Nothing scheduled — post one!</p>}

      {runs.map((run) => {
        const joined = run.players.some((p) => p.id === user.id);
        const isHost = run.host.id === user.id;
        const isFull = run.players.length >= run.max_players;
        return (
          <div className="run-card" key={run.id}>
            <div className="run-when">{formatStart(run.starts_at)}</div>
            <div className="muted">
              {run.skill_level} · {run.players.length}/{run.max_players} players
              · hosted by {run.host.name}
            </div>
            <div className="muted small">
              {run.players.map((p) => p.name).join(", ")}
            </div>
            <div className="run-actions">
              {isHost ? (
                <button
                  className="danger"
                  onClick={() => call(`/runs/${run.id}`, "DELETE")}
                >
                  Cancel run
                </button>
              ) : joined ? (
                <button onClick={() => call(`/runs/${run.id}/leave`, "POST")}>
                  Leave
                </button>
              ) : (
                <button
                  disabled={isFull}
                  onClick={() => call(`/runs/${run.id}/join`, "POST")}
                >
                  {isFull ? "Full" : "Join"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </aside>
  );
}
