import { FormEvent, useEffect, useState } from "react";
import { api, ApiError } from "../api";
import { Campaign, CampaignChannel, Customer } from "../types";
import { StatusBadge } from "../components/StatusBadge";

const CHANNEL_OPTIONS: CampaignChannel[] = ["EMAIL", "SMS", "WHATSAPP"];

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [segment, setSegment] = useState("");
  const [channel, setChannel] = useState<CampaignChannel>("EMAIL");
  const [message, setMessage] = useState("");
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);

  const loadAll = async () => {
    const [campaignData, customerData] = await Promise.all([
      api.get<Campaign[]>("/campaigns"),
      api.get<Customer[]>("/customers")
    ]);
    setCampaigns(campaignData);
    setCustomers(customerData);
  };

  useEffect(() => {
    loadAll()
      .catch(() => setError("Could not load campaigns"))
      .finally(() => setLoading(false));
  }, []);

  const toggleCustomer = (id: string) => {
    setSelectedCustomerIds((current) =>
      current.includes(id) ? current.filter((existing) => existing !== id) : [...current, id]
    );
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/campaigns", {
        name,
        segment,
        channel,
        message,
        customerIds: selectedCustomerIds
      });
      setName("");
      setSegment("");
      setMessage("");
      setSelectedCustomerIds([]);
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create campaign");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">New campaign</h2>
        </div>
        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="field">
              <label>Name</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Summer promo" />
            </div>
            <div className="field">
              <label>Segment</label>
              <input
                required
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                placeholder="Gold-tier guests"
              />
            </div>
            <div className="field">
              <label>Channel</label>
              <select value={channel} onChange={(e) => setChannel(e.target.value as CampaignChannel)}>
                {CHANNEL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field" style={{ marginTop: "0.85rem" }}>
            <label>Message</label>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enjoy 20% off your next stay..."
            />
          </div>

          <div className="field" style={{ marginTop: "0.85rem" }}>
            <label>Recipients ({selectedCustomerIds.length} selected)</label>
            <div className="checkbox-list">
              {customers.length === 0 ? (
                <span className="empty-state">Add customers first.</span>
              ) : (
                customers.map((customer) => (
                  <label key={customer.id} className="checkbox-pill">
                    <input
                      type="checkbox"
                      checked={selectedCustomerIds.includes(customer.id)}
                      onChange={() => toggleCustomer(customer.id)}
                    />
                    {customer.fullName}
                  </label>
                ))
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ marginTop: "0.85rem" }}
            disabled={submitting || !selectedCustomerIds.length}
          >
            {submitting ? "Sending..." : "Create campaign"}
          </button>
        </form>
        {error ? <div className="banner-error">{error}</div> : null}
      </div>

      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Campaigns</h2>
          <span className="card__meta">{campaigns.length} total</span>
        </div>
        {loading ? (
          <div className="page-loading">Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="empty-state">No campaigns yet.</div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Segment</th>
                  <th>Channel</th>
                  <th>Status</th>
                  <th>Recipients</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td>{campaign.name}</td>
                    <td>{campaign.segment}</td>
                    <td>{campaign.channel}</td>
                    <td>
                      <StatusBadge value={campaign.status} />
                    </td>
                    <td>{campaign.recipients.length}</td>
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
