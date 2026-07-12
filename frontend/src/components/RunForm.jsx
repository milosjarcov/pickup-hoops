import { useState } from "react";
import { api } from "../api";
import { useAuth } from "../AuthContext";

export default function RunForm({ courtId, onCreated, onCancel }) {
  const { token } = useAuth();
  const [startsAt, setStartsAt] = useState("");
  const [skillLevel, setSkillLevel] = useState("casual");
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      // datetime-local gives "2026-07-14T19:00" — already valid ISO for the API.
      await api("/runs", {
        method: "POST",
        token,
        body: {
          court_id: courtId,
          starts_at: startsAt,
          skill_level: skillLevel,
          max_players: Number(maxPlayers),
        },
      });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="run-form" onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}
      <label>
        When
        <input
          type="datetime-local"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          required
        />
      </label>
      <label>
        Skill level
        <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)}>
          <option value="casual">Casual</option>
          <option value="intermediate">Intermediate</option>
          <option value="competitive">Competitive</option>
        </select>
      </label>
      <label>
        Max players
        <input
          type="number"
          min={2}
          max={30}
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(e.target.value)}
          required
        />
      </label>
      <div className="run-actions">
        <button type="submit" disabled={busy}>
          {busy ? "Posting…" : "Post run"}
        </button>
        <button type="button" className="link-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
