"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { CapacityReport } from "@/lib/types";
import PendingHint from "@/components/pending-hint";

export default function CapacityPage() {
  const [reports, setReports] = useState<CapacityReport[] | null>(null);
  const [metricName, setMetricName] = useState("");
  const [rawData, setRawData] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadReports() {
    api
      .listCapacityReports()
      .then(setReports)
      .catch((e) => setError(String(e.message ?? e)));
  }

  useEffect(loadReports, []);

  async function onGenerate(e: FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    try {
      await api.generateCapacityReport(metricName, rawData);
      setMetricName("");
      setRawData("");
      loadReports();
    } catch (e: any) {
      setError(String(e.message ?? e));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <main>
      <div className="page-header">
        <div>
          <h1>Capacity Planning</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Paste a metric's time series to get a trend read and forecast.
          </p>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Analyze a metric</h2>
        <form onSubmit={onGenerate}>
          <label>
            Metric name
            <input
              required
              value={metricName}
              onChange={(e) => setMetricName(e.target.value)}
              placeholder="orders-db connection pool usage (%)"
            />
          </label>
          <label>
            Data (one point per line, e.g. "date, value")
            <textarea
              required
              rows={8}
              value={rawData}
              onChange={(e) => setRawData(e.target.value)}
              placeholder={"2026-07-01, 62\n2026-07-08, 68\n2026-07-15, 74\n2026-07-22, 81\n2026-07-29, 89"}
            />
          </label>
          <div>
            <button className="btn" type="submit" disabled={generating}>
              {generating ? "Analyzing…" : "Analyze Trend"}
            </button>
          </div>
        </form>
        <PendingHint active={generating} />
      </div>

      {error && <p className="error">{error}</p>}

      <h2>Past Reports</h2>
      {!reports && <p className="empty">Loading…</p>}
      {reports && reports.length === 0 && <p className="empty">No capacity reports yet.</p>}
      {reports && reports.length > 0 && (
        <div className="incident-list">
          {reports.map((report) => (
            <Link key={report.id} href={`/capacity/${report.id}`} className="incident-row">
              <div>
                <div className="incident-title">{report.metricName}</div>
                <div className="incident-meta">{new Date(report.createdAt).toLocaleString()}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
