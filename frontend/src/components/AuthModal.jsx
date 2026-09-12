import { useEffect, useRef, useState } from "react";
import { useAuth } from "../AuthContext";
import { Close } from "./icons";

/**
 * Sign-in as an interruption, not a destination. It opens over the map with
 * the reason the user hit it ("Join this run"), so the context is never lost.
 */
export default function AuthModal() {
  const { prompt, closeAuth, login, register, loginAsDemo } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const firstField = useRef(null);

  // Fresh start each time it opens; the password never lingers in state.
  useEffect(() => {
    if (!prompt) return;
    setError(null);
    setPassword("");
    firstField.current?.focus();
  }, [prompt]);

  useEffect(() => {
    if (!prompt) return;
    const onKey = (e) => e.key === "Escape" && closeAuth();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prompt, closeAuth]);

  if (!prompt) return null;

  async function run(label, fn) {
    setError(null);
    setBusy(label);
    try {
      await fn();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  }

  const submit = (e) => {
    e.preventDefault();
    run("form", () =>
      mode === "login" ? login(email, password) : register(name, email, password),
    );
  };

  return (
    <div
      className="sheet-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && closeAuth()}
    >
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Sign in">
        <button className="icon-btn sheet-close" onClick={closeAuth} aria-label="Close">
          <Close />
        </button>

        <h2>{mode === "login" ? "Sign in" : "Create account"}</h2>
        <p className="sheet-why">
          {prompt.reason
            ? `${prompt.reason} needs an account. It takes a second.`
            : "Browsing is open to everyone. An account is only needed to post or join."}
        </p>

        {error && <p className="error">{error}</p>}

        <button
          className="demo-cta"
          disabled={Boolean(busy)}
          onClick={() => run("demo", loginAsDemo)}
        >
          {busy === "demo" ? "Opening demo…" : "Continue with the demo account"}
        </button>
        <p className="demo-note">No sign-up. Shared account, seeded with real runs.</p>

        <div className="or">
          <span className="label">or</span>
        </div>

        <form onSubmit={submit}>
          {mode === "register" && (
            <label>
              <span className="label">Name</span>
              <input
                ref={mode === "register" ? firstField : null}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={80}
              />
            </label>
          )}
          <label>
            <span className="label">Email</span>
            <input
              ref={mode === "login" ? firstField : null}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            <span className="label">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              maxLength={72}
            />
          </label>
          <button className="block" type="submit" disabled={Boolean(busy)}>
            {busy === "form"
              ? "Working…"
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <p className="switch">
          {mode === "login" ? "No account yet? " : "Already have one? "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError(null);
            }}
          >
            {mode === "login" ? "Create one" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
