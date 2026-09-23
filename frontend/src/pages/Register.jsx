import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import AuthLayout from "../components/AuthLayout";
import Field from "../components/Field";
import { ChevronRightIcon } from "../components/Icons";
import Spinner from "../components/Spinner";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from ?? "/map";
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
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Post runs and join games around Montreal."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" state={{ from }} className="link-chevron">
            Sign in
            <ChevronRightIcon />
          </Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field-group">
          <Field
            label="Name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={80}
            autoFocus
          />
          <Field
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {/* Same limits as the API: bcrypt ignores anything past 72 bytes. */}
          <Field
            label="Password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            maxLength={72}
          />
        </div>
        <p className="field-hint">Use at least 8 characters.</p>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary btn-large auth-submit" disabled={busy}>
          {busy ? <Spinner label="Creating account" /> : "Create Account"}
        </button>
      </form>
    </AuthLayout>
  );
}
