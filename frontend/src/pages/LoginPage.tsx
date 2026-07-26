import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../api";

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand__mark">M</span>
          <div>
            <div className="auth-brand__title">The Manor Hotel</div>
            <div className="auth-brand__subtitle">CRM Suite</div>
          </div>
        </div>

        <form onSubmit={submit}>
          <div className="field" style={{ marginBottom: "0.85rem" }}>
            <label>Email</label>
            <input
              type="email"
              required
              placeholder="you@manorhotel.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field" style={{ marginBottom: "0.85rem" }}>
            <label>Password</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary btn-full" disabled={submitting}>
            {submitting ? "Please wait..." : "Sign in"}
          </button>

          {error ? <div className="banner-error">{error}</div> : null}
        </form>

        <div className="auth-hint">
          Staff accounts are provisioned by an administrator — see the "Staff" section once signed in as an admin.
          <br />
          Demo accounts (password <strong>Password123!</strong>): admin@manorhotel.com &middot;
          reception@manorhotel.com &middot; marketing@manorhotel.com
        </div>
      </div>
    </div>
  );
}
