import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>🏀 Pickup Hoops</h1>
        <h2>Create an account</h2>
        {error && <p className="error">{error}</p>}
        <label>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={80}
            autoFocus
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            maxLength={72}
          />
        </label>
        <button type="submit" disabled={busy}>
          {busy ? "Creating…" : "Register"}
        </button>
        <p className="switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
