import { FormEvent, useEffect, useState } from "react";
import { api, ApiError } from "../api";
import { Complaint, ComplaintSeverity, ComplaintStatus, Customer } from "../types";
import { StatusBadge } from "../components/StatusBadge";

const SEVERITY_OPTIONS: ComplaintSeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUS_OPTIONS: ComplaintStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [customerId, setCustomerId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<ComplaintSeverity>("MEDIUM");
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadAll = async () => {
    const [complaintData, customerData] = await Promise.all([
      api.get<Complaint[]>("/complaints"),
      api.get<Customer[]>("/customers")
    ]);
    setComplaints(complaintData);
    setCustomers(customerData);
  };

  useEffect(() => {
    loadAll()
      .catch(() => setError("Could not load complaints"))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/complaints", { customerId, title, description, severity });
      setCustomerId("");
      setTitle("");
      setDescription("");
      setSeverity("MEDIUM");
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to log complaint");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: ComplaintStatus) => {
    setError("");
    setBusyId(id);
    try {
      await api.patch(`/complaints/${id}`, { status });
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update complaint");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Log a complaint</h2>
        </div>
        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="field">
              <label>Customer</label>
              <select required value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Title</label>
              <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Noisy room" />
            </div>
            <div className="field">
              <label>Severity</label>
              <select value={severity} onChange={(e) => setSeverity(e.target.value as ComplaintSeverity)}>
                {SEVERITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field" style={{ marginTop: "0.85rem" }}>
            <label>Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened..."
            />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: "0.85rem" }} disabled={submitting || !customers.length}>
            {submitting ? "Logging..." : "Log complaint"}
          </button>
        </form>
        {!loading && !customers.length ? (
          <div className="banner-error">Add a customer first before logging a complaint.</div>
        ) : null}
        {error ? <div className="banner-error">{error}</div> : null}
      </div>

      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Complaints</h2>
          <span className="card__meta">{complaints.length} logged</span>
        </div>
        {loading ? (
          <div className="page-loading">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">No complaints logged. That's a good sign.</div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Title</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Logged</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.id}>
                    <td>{complaint.customer?.fullName ?? complaint.customerId}</td>
                    <td>{complaint.title}</td>
                    <td>
                      <StatusBadge value={complaint.severity} />
                    </td>
                    <td>
                      <StatusBadge value={complaint.status} />
                    </td>
                    <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                    <td>
                      <select
                        value={complaint.status}
                        disabled={busyId === complaint.id}
                        onChange={(e) => updateStatus(complaint.id, e.target.value as ComplaintStatus)}
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
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
