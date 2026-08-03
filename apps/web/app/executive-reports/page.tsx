"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ExecutiveReport } from "@/lib/types";
import PendingHint from "@/components/pending-hint";

function defaultRange() {
  const end = new Date();
  const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  const toLocalInput = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  return { start: toLocalInput(start), end: toLocalInput(end) };
}

export default function ExecutiveReportsPage() {
  const [reports, setReports] = useState<ExecutiveReport[] | null>(null);
  const range = defaultRange();
  const [periodStart, setPeriodStart] = useState(range.start);
  const [periodEnd, setPeriodEnd] = useState(range.end);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadReports() {
    api
      .listExecutiveReports()
      .then(setReports)
      .catch((e) => setError(String(e.message ?? e)));
  }

  useEffect(loadReports, []);

  async function onGenerate(e: FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    try {
      await api.generateExecutiveReport(
        new Date(periodStart).toISOString(),
        new Date(periodEnd).toISOString(),
      );
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
          <h1>Executive Reports</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Leadership-level rollup of a period's reliability and change activity.
          </p>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Generate for a period</h2>
        <form onSubmit={onGenerate}>
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
      {reports && reports.length === 0 && <p className="empty">No executive reports yet.</p>}
      {reports && reports.length > 0 && (
        <div className="incident-list">
          {reports.map((report) => (
            <Link key={report.id} href={`/executive-reports/${report.id}`} className="incident-row">
              <div>
                <div className="incident-title">
                  {new Date(report.periodStart).toLocaleDateString()} –{" "}
                  {new Date(report.periodEnd).toLocaleDateString()}
                </div>
                <div className="incident-meta">Generated {new Date(report.createdAt).toLocaleString()}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
