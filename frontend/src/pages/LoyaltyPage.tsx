import { FormEvent, useEffect, useState } from "react";
import { api, ApiError } from "../api";
import { Customer } from "../types";
import { StatusBadge } from "../components/StatusBadge";

export function LoyaltyPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [customerId, setCustomerId] = useState("");
  const [points, setPoints] = useState(0);
  const [reason, setReason] = useState("");

  const loadCustomers = async () => {
    const data = await api.get<Customer[]>("/customers");
    setCustomers(data);
  };

  useEffect(() => {
    loadCustomers()
      .catch(() => setError("Could not load customers"))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      await api.post("/loyalty/transactions", { customerId, points, reason });
      setMessage("Loyalty points updated.");
      setPoints(0);
      setReason("");
      await loadCustomers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to record loyalty transaction");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Award or redeem points</h2>
        </div>
        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="field">
              <label>Customer</label>
              <select required value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.fullName} ({customer.loyaltyPoints} pts)
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Points (use negative to redeem)</label>
              <input
                type="number"
                required
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
              />
            </div>
            <div className="field">
              <label>Reason</label>
              <input
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Stay bonus, redemption, etc."
              />
            </div>
            <button type="submit" className="btn-primary" disabled={submitting || !customers.length}>
              {submitting ? "Saving..." : "Record transaction"}
            </button>
          </div>
        </form>
        {error ? <div className="banner-error">{error}</div> : null}
        {message ? <div className="banner-success">{message}</div> : null}
      </div>

      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Loyalty standings</h2>
        </div>
        {loading ? (
          <div className="page-loading">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="empty-state">No customers yet.</div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Tier</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {[...customers]
                  .sort((a, b) => b.loyaltyPoints - a.loyaltyPoints)
                  .map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.fullName}</td>
                      <td>
                        <StatusBadge value={customer.loyaltyTier} />
                      </td>
                      <td>{customer.loyaltyPoints}</td>
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
