import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { formatStart, initials } from "../utils";
import RunForm from "./RunForm";

function SignInCta() {
  return (
    <div className="signin-cta">
      <p>
        Want in? Make an account to join runs and post your own — takes 30
        seconds.
      </p>
      <div className="cta-row">
        <Link to="/register">
          <button className="primary" style={{ width: "100%" }}>
            Sign up
          </button>
        </Link>
        <Link to="/login" style={{ flex: 1 }}>
          <button className="ghost" style={{ width: "100%" }}>
            Log in
          </button>
        </Link>
      </div>
    </div>
  );
}

export default function CourtPanel({ court, onBack, onChanged }) {
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
      onChanged?.();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="court-detail">
      <button className="link-btn back-btn" onClick={onBack}>
        ← All courts
      </button>
      <h2>{court.name}</h2>
      <p className="address">{court.address}</p>

      {error && <p className="error">{error}</p>}

      {token &&
        (showForm ? (
          <RunForm
            courtId={court.id}
            onCreated={() => {
              setShowForm(false);
              refresh();
              onChanged?.();
            }}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <button
            className="primary post-run-btn"
            onClick={() => setShowForm(true)}
          >
            + Post a run
          </button>
        ))}
      {!token && <SignInCta />}

      <div className="section-label">Upcoming runs</div>
      {runs.length === 0 && (
        <div className="empty-state">
          Nothing scheduled here yet —<br />
          post the first run
        </div>
      )}

      {runs.map((run) => {
        const { day, time } = formatStart(run.starts_at);
        const joined = user ? run.players.some((p) => p.id === user.id) : false;
        const isHost = user ? run.host.id === user.id : false;
        const isFull = run.players.length >= run.max_players;
        const fill = Math.min(100, (run.players.length / run.max_players) * 100);
        return (
          <div className="run-card" key={run.id}>
            <div className="run-top">
              <div>
                <div className="run-time">{time}</div>
                <div className="run-day">{day}</div>
              </div>
              <span className={`badge ${run.skill_level}`}>{run.skill_level}</span>
            </div>
            <div className="capacity">
              <div className="capacity-track">
                <div
                  className={`capacity-fill${isFull ? " full" : ""}`}
                  style={{ width: `${fill}%` }}
                />
              </div>
              <div className="capacity-label">
                <span>
                  {run.players.length}/{run.max_players} in
                </span>
                <span>
                  {isFull
                    ? "FULL"
                    : `${run.max_players - run.players.length} SPOTS LEFT`}
                </span>
              </div>
            </div>
            <div className="player-list">
              {run.players.map((p) => (
                <span
                  key={p.id}
                  className={`avatar${p.id === run.host.id ? " host" : ""}`}
                  title={p.id === run.host.id ? `${p.name} (host)` : p.name}
                >
                  {initials(p.name)}
                </span>
              ))}
              <span className="host-tag">host: {run.host.name}</span>
            </div>
            <div className="run-actions">
              {!token ? (
                <Link to="/register" style={{ flex: 1 }}>
                  <button className="primary" style={{ width: "100%" }}>
                    Sign up to join
                  </button>
                </Link>
              ) : isHost ? (
                <button
                  className="danger"
                  onClick={() => call(`/runs/${run.id}`, "DELETE")}
                >
                  Cancel run
                </button>
              ) : joined ? (
                <button
                  className="ghost"
                  onClick={() => call(`/runs/${run.id}/leave`, "POST")}
                >
                  Leave
                </button>
              ) : (
                <button
                  className="primary"
                  disabled={isFull}
                  onClick={() => call(`/runs/${run.id}/join`, "POST")}
                >
                  {isFull ? "Run is full" : "Join run"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
