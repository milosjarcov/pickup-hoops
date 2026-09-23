import { useId, useState } from "react";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { toDateValue, toTimeValue } from "../lib/format";
import Segmented from "./Segmented";
import Sheet from "./Sheet";
import Spinner from "./Spinner";
import Stepper from "./Stepper";

const SKILL_LEVELS = [
  { value: "casual", label: "Casual" },
  { value: "intermediate", label: "Intermediate" },
  { value: "competitive", label: "Competitive" },
];

// Default to the next full hour: at 2:20 PM the form suggests 3:00 PM.
// setHours rolls over into tomorrow on its own after 11 PM.
function nextFullHour() {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return d;
}

// "New Run" sheet. Laid out like an iOS form: Cancel and Post in the title
// bar, settings in grouped rows below.
export default function RunForm({ court, onCreated, onCancel }) {
  const titleId = useId();
  return (
    <Sheet labelledBy={titleId} onClose={onCancel}>
      <RunFormContent court={court} titleId={titleId} onCreated={onCreated} onCancel={onCancel} />
    </Sheet>
  );
}

// The form itself, without the modal around it. The landing page shows this
// directly as a preview of what posting a run looks like.
export function RunFormContent({ court, titleId, onCreated, onCancel }) {
  const { token } = useAuth();
  const [start] = useState(nextFullHour);
  const [date, setDate] = useState(() => toDateValue(start));
  const [time, setTime] = useState(() => toTimeValue(start));
  const [skillLevel, setSkillLevel] = useState("casual");
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      // "2026-09-24" + "19:00" -> "2026-09-24T19:00", valid ISO for the API.
      await api("/runs", {
        method: "POST",
        token,
        body: {
          court_id: court.id,
          starts_at: `${date}T${time}`,
          skill_level: skillLevel,
          max_players: maxPlayers,
        },
      });
      await onCreated();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <header className="sheet-nav">
        <button type="button" className="btn-text" onClick={onCancel}>
          Cancel
        </button>
        <div className="sheet-heading">
          <h2 id={titleId}>New Run</h2>
          <p>{court.name}</p>
        </div>
        <button type="submit" className="btn-text is-strong" disabled={busy}>
          {busy ? <Spinner label="Posting" /> : "Post"}
        </button>
      </header>

      <div className="sheet-body">
        <div className="group">
          <label className="group-row">
            <span>Date</span>
            <input
              type="date"
              className="inline-input"
              value={date}
              min={toDateValue(new Date())}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>
          <label className="group-row">
            <span>Time</span>
            <input
              type="time"
              className="inline-input"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </label>
        </div>

        <p className="group-label">Skill Level</p>
        <Segmented
          name="skill_level"
          label="Skill level"
          options={SKILL_LEVELS}
          value={skillLevel}
          onChange={setSkillLevel}
        />

        <div className="group group-spaced">
          <div className="group-row">
            <span>Max Players</span>
            <Stepper label="Players" value={maxPlayers} min={2} max={30} onChange={setMaxPlayers} />
          </div>
        </div>
        <p className="group-footer">You'll be the first player in the run.</p>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
