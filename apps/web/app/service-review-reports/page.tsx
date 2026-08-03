"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ServiceReviewReport } from "@/lib/types";
import PendingHint from "@/components/pending-hint";

function defaultRange() {
  const end = new Date();
  const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  const toLocalInput = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  return { start: toLocalInput(start), end: toLocalInput(end) };
}

export default function ServiceReviewReportsPage() {
  const [reports, setReports] = useState<ServiceReviewReport[] | null>(null);
  const range = defaultRange();
  const [accountName, setAccountName] = useState("");
  const [periodStart, setPeriodStart] = useState(range.start);
  const [periodEnd, setPeriodEnd] = useState(range.end);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadReports() {
    api
      .listServiceReviewReports()
      .then(setReports)
      .catch((e) => setError(String(e.message ?? e)));
  }

  useEffect(loadReports, []);

  async function onGenerate(e: FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    try {
      await api.generateServiceReviewReport(
        accountName,
        new Date(periodStart).toISOString(),
        new Date(periodEnd).toISOString(),
      );
      setAccountName("");
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
          <h1>Service Review Reports</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Account-facing QBR-style report — mainly for MSP customer reviews.
          </p>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Generate for an account</h2>
        <form onSubmit={onGenerate}>
          <label>
            Account name
            <input
              required
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Acme Corp"
            />
          </label>
          <label>
            From
            <input
              type="datetime-local"
              required
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
            />
          </label>
          <label>
            To
            <input
              type="datetime-local"
              required
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
            />
          </label>
          <div>
            <button className="btn" type="submit" disabled={generating}>
              {generating ? "Generating…" : "Generate Report"}
            </button>
          </div>
        </form>
        <PendingHint active={generating} />
      </div>

      {error && <p className="error">{error}</p>}

      <h2>Past Reports</h2>
      {!reports && <p className="empty">Loading…</p>}
      {reports && reports.length === 0 && <p className="empty">No service review reports yet.</p>}
      {reports && reports.length > 0 && (
        <div className="incident-list">
          {reports.map((report) => (
            <Link
              key={report.id}
              href={`/service-review-reports/${report.id}`}
              className="incident-row"
            >
              <div>
                <div className="incident-title">{report.accountName}</div>
                <div className="incident-meta">
                  {new Date(report.periodStart).toLocaleDateString()} –{" "}
                  {new Date(report.periodEnd).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
