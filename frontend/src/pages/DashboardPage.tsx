import { useEffect, useState } from "react";
import { api, ApiError } from "../api";
import { DashboardKpis } from "../types";

const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<DashboardKpis>("/dashboard/kpis")
      .then(setKpis)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load dashboard metrics"));
  }, []);

  if (error) {
    return <div className="banner-error">{error}</div>;
  }

  if (!kpis) {
    return <div className="page-loading">Loading dashboard...</div>;
  }

  return (
    <div className="stat-grid">
      <div className="stat-card">
        <div className="stat-card__label">Total Customers</div>
        <div className="stat-card__value">{kpis.customers}</div>
      </div>
      <div className="stat-card">
        <div className="stat-card__label">Total Reservations</div>
        <div className="stat-card__value">{kpis.reservations}</div>
      </div>
      <div className="stat-card">
        <div className="stat-card__label">Open Complaints</div>
        <div className="stat-card__value">{kpis.complaintsOpen}</div>
      </div>
      <div className="stat-card">
        <div className="stat-card__label">Revenue Collected</div>
        <div className="stat-card__value stat-card__value--accent">
          {currencyFormatter.format(Number(kpis.revenueCollected))}
        </div>
      </div>
    </div>
  );
}
