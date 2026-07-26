import { FormEvent, useEffect, useState } from "react";
import { api, ApiError } from "../api";
import { Invoice, PaymentMethod, Reservation } from "../types";
import { StatusBadge } from "../components/StatusBadge";

const METHOD_OPTIONS: PaymentMethod[] = ["CASH", "CARD", "BANK_TRANSFER", "MOBILE_MONEY"];

export function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [reservationId, setReservationId] = useState("");

  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [payingSubmitting, setPayingSubmitting] = useState(false);

  const loadAll = async () => {
    const [invoiceData, reservationData] = await Promise.all([
      api.get<Invoice[]>("/invoices"),
      api.get<Reservation[]>("/reservations")
    ]);
    setInvoices(invoiceData);
    setReservations(reservationData);
  };

  useEffect(() => {
    loadAll()
      .catch(() => setError("Could not load invoices"))
      .finally(() => setLoading(false));
  }, []);

  const uninvoicedReservations = reservations.filter((r) => !invoices.some((inv) => inv.reservationId === r.id));

  const generateInvoice = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setGenerating(true);
    try {
      await api.post("/invoices", { reservationId });
      setReservationId("");
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to generate invoice");
    } finally {
      setGenerating(false);
    }
  };

  const recordPayment = async (e: FormEvent) => {
    e.preventDefault();
    if (!payingInvoiceId) return;
    setError("");
    setPayingSubmitting(true);
    try {
      await api.post(`/invoices/${payingInvoiceId}/payments`, {
        method,
        amount: Number(amount),
        reference: reference || undefined
      });
      setPayingInvoiceId(null);
      setAmount("");
      setReference("");
      setMethod("CASH");
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to record payment");
    } finally {
      setPayingSubmitting(false);
    }
  };

  return (
    <>
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Generate invoice</h2>
        </div>
        <form onSubmit={generateInvoice}>
          <div className="form-grid">
            <div className="field">
              <label>Reservation</label>
              <select required value={reservationId} onChange={(e) => setReservationId(e.target.value)}>
                <option value="">Select reservation</option>
                {uninvoicedReservations.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.customer?.fullName ?? r.customerId} - Room {r.room?.roomNumber ?? r.roomId}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={generating || !uninvoicedReservations.length}>
              {generating ? "Generating..." : "Generate invoice"}
            </button>
          </div>
        </form>
        {!loading && !uninvoicedReservations.length ? (
          <div className="empty-state">Every reservation already has an invoice.</div>
        ) : null}
        {error ? <div className="banner-error">{error}</div> : null}
      </div>

      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Invoices</h2>
          <span className="card__meta">{invoices.length} invoice{invoices.length === 1 ? "" : "s"}</span>
        </div>
        {loading ? (
          <div className="page-loading">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="empty-state">No invoices yet.</div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Status</th>
                  <th>Issued</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const paid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
                  return (
                    <tr key={invoice.id}>
                      <td>{invoice.reservation?.customer?.fullName ?? "-"}</td>
                      <td>${Number(invoice.totalAmount).toFixed(2)}</td>
                      <td>${paid.toFixed(2)}</td>
                      <td>
                        <StatusBadge value={invoice.status} />
                      </td>
                      <td>{new Date(invoice.issuedAt).toLocaleDateString()}</td>
                      <td>
                        {invoice.status === "PAID" ? (
                          "-"
                        ) : payingInvoiceId === invoice.id ? (
                          <form onSubmit={recordPayment} className="inline-form">
                            <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                              {METHOD_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              required
                              placeholder="Amount"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              style={{ width: "6rem" }}
                            />
                            <button type="submit" className="btn-primary btn-sm" disabled={payingSubmitting}>
                              {payingSubmitting ? "Saving..." : "Save"}
                            </button>
                            <button type="button" className="btn-secondary btn-sm" onClick={() => setPayingInvoiceId(null)}>
                              Cancel
                            </button>
                          </form>
                        ) : (
                          <button type="button" className="btn-secondary btn-sm" onClick={() => setPayingInvoiceId(invoice.id)}>
                            Record payment
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
