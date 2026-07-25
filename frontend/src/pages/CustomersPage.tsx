import { FormEvent, useEffect, useState } from "react";
import { api, ApiError } from "../api";
import { Customer } from "../types";
import { StatusBadge } from "../components/StatusBadge";

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);
    try {
      await api.post("/customers", {
        fullName,
        email: email || undefined,
        phone: phone || undefined,
        country: country || undefined
      });
      setFullName("");
      setEmail("");
      setPhone("");
      setCountry("");
      await loadCustomers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create customer");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Add customer</h2>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
              />
            </div>
            <div className="field">
              <label>Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+250 700 000 000" />
            </div>
            <div className="field">
              <label>Country</label>
              <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Rwanda" />
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save customer"}
            </button>
          </div>
        </form>
        {error ? <div className="banner-error">{error}</div> : null}
      </div>

      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Guest directory</h2>
          <span className="card__meta">{customers.length} customers</span>
        </div>
        {loading ? (
          <div className="page-loading">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="empty-state">No customers yet. Add your first guest above.</div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Country</th>
                  <th>Loyalty tier</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.fullName}</td>
                    <td>{customer.email || "—"}</td>
                    <td>{customer.phone || "—"}</td>
                    <td>{customer.country || "—"}</td>
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
