import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import AppIcon from "./AppIcon";
import Sheet from "./Sheet";
import Spinner from "./Spinner";

// Shown when someone who isn't signed in tries to join or post a run.
// Anyone can browse the map, and this is the only point where we ask who
// you are. Guest is the first choice because it costs nothing.
//
// onAuthed(token) runs after a guest sign-in, so the action that opened this
// prompt (joining a run, say) can carry on without a second tap.
export default function AuthPrompt({ title, message, returnTo, onAuthed, onClose }) {
  const { continueAsGuest } = useAuth();
  const titleId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleGuest() {
    setBusy(true);
    setError(null);
    try {
      const token = await continueAsGuest();
      onClose();
      await onAuthed(token);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <Sheet className="auth-prompt" labelledBy={titleId} onClose={onClose}>
      <div className="auth-prompt-body">
        <AppIcon size={56} className="auth-prompt-icon" />
        <h2 id={titleId}>{title}</h2>
        <p className="auth-prompt-message">{message}</p>
        <button type="button" className="btn btn-primary btn-large" onClick={handleGuest} disabled={busy}>
          {busy ? <Spinner label="Signing in" /> : "Continue as Guest"}
        </button>
        <p className="auth-prompt-note">No email needed. You'll get a temporary account.</p>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="auth-prompt-links">
          <Link to="/login" state={{ from: returnTo }}>
            Sign In
          </Link>
          <span aria-hidden="true">·</span>
          <Link to="/register" state={{ from: returnTo }}>
            Create Account
          </Link>
        </div>
        <button type="button" className="btn-text auth-prompt-close" onClick={onClose}>
          Not Now
        </button>
      </div>
    </Sheet>
  );
}
