import { useEffect, useState } from "react";
import { api, ApiError } from "../api";
import { DashboardReport } from "../types";

const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function ReportsPage() {
  const [report, setReport] = useState<DashboardReport | null>(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    api
      .get<DashboardReport>("/dashboard/reports")
      .then(setReport)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load reports"));
  }, []);

  const downloadCsv = async () => {
    setDownloading(true);
    try {
      const blob = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000"}/dashboard/reports/export`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("manor_crm_token") ?? ""}`
        }
      });
      if (!blob.ok) {
        throw new Error("Could not download report");
      }

      const url = window.URL.createObjectURL(await blob.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = "manor-hotel-report.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not download report");
    } finally {
      setDownloading(false);
    }
  };

  if (error) {
    return <div className="banner-error">{error}</div>;
  }

  if (!report) {
    return <div className="page-loading">Loading reports...</div>;
  }

  const summary = report.summary;
  const satisfaction = report.guestSatisfaction;
  const maxTrendCount = Math.max(...report.bookingTrends.map((item) => item.count), 1);

  return (
    <div className="reports-page">
      <div className="page-actions">
        <button className="btn-primary" type="button" onClick={downloadCsv} disabled={downloading}>
          {downloading ? "Preparing export..." : "Download CSV report"}
        </button>
      </div>

      <div className="stat-grid stat-grid--compact">
        <div className="stat-card">
          <div className="stat-card__label">Customers</div>
          <div className="stat-card__value">{summary.totalCustomers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Rooms</div>
          <div className="stat-card__value">{summary.totalRooms}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Occupancy</div>
          <div className="stat-card__value">{summary.occupancyRate}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Active Reservations</div>
          <div className="stat-card__value">{summary.activeReservations}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Open Complaints</div>
          <div className="stat-card__value">{summary.openComplaints}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Revenue Collected</div>
          <div className="stat-card__value stat-card__value--accent">
            {currencyFormatter.format(Number(summary.revenueCollected))}
          </div>
        </div>
      </div>

      <div className="report-panels">
        <section className="report-panel">
          <h3>Guest Satisfaction</h3>
          <div className="chart-meter">
            <div className="chart-meter__track">
              <div className="chart-meter__fill" style={{ width: `${satisfaction.satisfactionRate}%` }} />
            </div>
            <div className="chart-meter__labels">
              <span>Satisfaction Score</span>
              <strong>{satisfaction.satisfactionRate}%</strong>
            </div>
          </div>
          <ul>
            <li>
              <span>Resolved Complaints</span>
              <strong>{satisfaction.resolvedComplaints}</strong>
            </li>
            <li>
              <span>Open Complaints</span>
              <strong>{satisfaction.openComplaints}</strong>
            </li>
          </ul>
        </section>

        <section className="report-panel">
          <h3>Booking Trends</h3>
          <div className="trend-chart" role="img" aria-label="Booking trends chart">
            {report.bookingTrends.map((item) => (
              <div key={item.month} className="trend-chart__column">
                <div className="trend-chart__bar-wrapper">
                  <div
                    className="trend-chart__bar"
                    style={{ height: `${Math.max((item.count / maxTrendCount) * 100, item.count > 0 ? 14 : 6)}%` }}
                  />
                </div>
                <span>{item.month.slice(5)}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="report-panel">
          <h3>Room Status</h3>
          <ul>
            {report.roomStatus.map((item) => (
              <li key={item.status}>
                <span>{item.status}</span>
                <strong>{item.count}</strong>
              </li>
            ))}
          </ul>
        </section>

        <section className="report-panel">
          <h3>Reservation Status</h3>
          <ul>
            {report.reservationStatus.map((item) => (
              <li key={item.status}>
                <span>{item.status}</span>
                <strong>{item.count}</strong>
              </li>
            ))}
          </ul>
        </section>

        <section className="report-panel">
          <h3>Complaint Severity</h3>
          <ul>
            {report.complaintSeverity.map((item) => (
              <li key={item.severity}>
                <span>{item.severity}</span>
                <strong>{item.count}</strong>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
