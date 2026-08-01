"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { KpiSummary } from "@/lib/types";

export default function KpiDashboardPage() {
  const [kpi, setKpi] = useState<KpiSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getKpiSummary()
      .then(setKpi)
      .catch((e) => setError(String(e.message ?? e)));
  }, []);

  return (
    <main>
      <div className="page-header">
        <div>
          <h1>KPI / SLA Dashboard</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Computed live from current incident data.
          </p>
        </div>
      </div>

      {error && <p className="error">Failed to load KPIs: {error}</p>}
      {!kpi && !error && <p className="empty">Loading…</p>}

      {kpi && (
        <>
          <div className="stat-grid">
            <div className="stat-tile">
              <div className="stat-label">Total Incidents</div>
              <div className="stat-value">{kpi.totalIncidents}</div>
            </div>
            <div className="stat-tile">
              <div className="stat-label">Open</div>
              <div className="stat-value">{kpi.openIncidents}</div>
            </div>
            <div className="stat-tile">
              <div className="stat-label">MTTR</div>
              <div className="stat-value">
                {kpi.mttrHours !== null ? `${kpi.mttrHours.toFixed(1)}h` : "—"}
              </div>
            </div>
            <div className={`stat-tile ${kpi.slaBreaches > 0 ? "stat-tile-critical" : ""}`}>
              <div className="stat-label">SLA Breaches</div>
              <div className="stat-value">{kpi.slaBreaches}</div>
            </div>
          </div>

          <h2>By Severity</h2>
          <div className="stat-grid">
            {Object.entries(kpi.countsBySeverity).map(([severity, count]) => (
              <div key={severity} className="stat-tile">
                <div className="stat-label">{severity}</div>
                <div className="stat-value">{count}</div>
                <div className="incident-meta">SLA target {kpi.slaTargetHours[severity]}h</div>
              </div>
            ))}
          </div>

          <h2>By Status</h2>
          <div className="stat-grid">
            {Object.entries(kpi.countsByStatus).map(([status, count]) => (
              <div key={status} className="stat-tile">
                <div className="stat-label">{status}</div>
                <div className="stat-value">{count}</div>
              </div>
            ))}
          </div>

          <p className="incident-meta" style={{ marginTop: "1.5rem" }}>
            Generated {new Date(kpi.generatedAt).toLocaleString()}
          </p>
        </>
      )}
    </main>
  );
}
