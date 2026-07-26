import { FormEvent, useEffect, useState } from "react";
import { api, ApiError } from "../api";
import { Role, StaffUser } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../auth/AuthContext";

const ROLE_OPTIONS: Role[] = ["RECEPTION", "MARKETING", "MANAGER", "ADMIN"];

export function StaffPage() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("RECEPTION");

  const loadStaff = async () => {
    const data = await api.get<StaffUser[]>("/users");
    setStaff(data);
  };

  useEffect(() => {
    loadStaff()
      .catch(() => setError("Could not load staff accounts"))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/users", { fullName, email, password, role });
      setFullName("");
      setEmail("");
      setPassword("");
      setRole("RECEPTION");
      await loadStaff();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create staff account");
    } finally {
      setSubmitting(false);
    }
  };

  const updateRole = async (id: string, nextRole: Role) => {
    setError("");
    try {
      await api.patch(`/users/${id}`, { role: nextRole });
      await loadStaff();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update role");
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    setError("");
    try {
      await api.patch(`/users/${id}`, { isActive: !isActive });
      await loadStaff();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update account status");
    }
  };

  return (
    <>
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Add staff account</h2>
        </div>
        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="field">
              <label>Full name</label>
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@manorhotel.com"
              />
            </div>
            <div className="field">
              <label>Temporary password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>
            <div className="field">
              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                {ROLE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Creating..." : "Create account"}
            </button>
          </div>
        </form>
        {error ? <div className="banner-error">{error}</div> : null}
      </div>

      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Staff directory</h2>
          <span className="card__meta">{staff.length} accounts</span>
        </div>
        {loading ? (
          <div className="page-loading">Loading staff...</div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member.id}>
                    <td>{member.fullName}</td>
                    <td>{member.email}</td>
                    <td>
                      <select value={member.role} onChange={(e) => updateRole(member.id, e.target.value as Role)}>
                        {ROLE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <StatusBadge value={member.isActive ? "ACTIVE" : "INACTIVE"} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        disabled={member.id === user?.sub}
                        onClick={() => toggleActive(member.id, member.isActive)}
                      >
                        {member.isActive ? "Deactivate" : "Reactivate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
