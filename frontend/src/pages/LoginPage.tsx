import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../api";
import { Role } from "../types";

export function LoginPage() {
  const { isAuthenticated, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("RECEPTION");
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
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(fullName, email, password, role);
      }
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

        <div className="auth-tabs">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
            Sign in
          </button>
          <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>
            Create account
          </button>
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

          {mode === "register" && (
            <div className="field" style={{ marginBottom: "0.85rem" }}>
              <label>Full name</label>
              <input
                required
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}

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

          {mode === "register" && (
            <div className="field" style={{ marginBottom: "0.85rem" }}>
              <label>Staff role</label>
              <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                <option value="RECEPTION">Reception</option>
                <option value="MARKETING">Marketing</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn-primary btn-full" disabled={submitting}>
            {submitting ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>

          {error ? <div className="banner-error">{error}</div> : null}
        </form>

        <div className="auth-hint">
          Demo accounts (password <strong>Password123!</strong>): admin@manorhotel.com &middot;
          reception@manorhotel.com &middot; marketing@manorhotel.com
        </div>
      </div>
    </div>
  );
}
