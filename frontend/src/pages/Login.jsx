import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import AuthLayout from "../components/AuthLayout";
import Field from "../components/Field";
import { ChevronRightIcon } from "../components/Icons";
import Spinner from "../components/Spinner";

export default function Login() {
  const { login, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  // Where to go after signing in: back to whatever sent you here, or the map.
  const location = useLocation();
  const from = location.state?.from ?? "/map";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // Both ways in share the same busy/error handling.
  async function signIn(attempt) {
    setError(null);
    setBusy(true);
    try {
      await attempt();
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Sign in to Pickup Hoops"
      subtitle="Find a game at courts across Montreal."
      footer={
        <>
          New to Pickup Hoops?{" "}
          <Link to="/register" state={{ from }} className="link-chevron">
            Create an account
            <ChevronRightIcon />
          </Link>
        </>
      }
    >
      <form
        className="auth-form"
        onSubmit={(e) => {
          e.preventDefault();
          signIn(() => login(email, password));
        }}
      >
        <div className="field-group">
          <Field
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          <Field
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary btn-large auth-submit" disabled={busy}>
          {busy ? <Spinner label="Signing in" /> : "Sign In"}
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-large auth-guest"
          disabled={busy}
          onClick={() => signIn(continueAsGuest)}
        >
          Continue as Guest
        </button>
      </form>
    </AuthLayout>
  );
}
