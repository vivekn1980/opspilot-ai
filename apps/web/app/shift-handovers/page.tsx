"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ShiftHandover } from "@/lib/types";
import PendingHint from "@/components/pending-hint";

function defaultRange() {
  const end = new Date();
  const start = new Date(end.getTime() - 12 * 60 * 60 * 1000);
  const toLocalInput = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  return { start: toLocalInput(start), end: toLocalInput(end) };
}

export default function ShiftHandoversPage() {
  const [handovers, setHandovers] = useState<ShiftHandover[] | null>(null);
  const range = defaultRange();
  const [periodStart, setPeriodStart] = useState(range.start);
  const [periodEnd, setPeriodEnd] = useState(range.end);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadHandovers() {
    api
      .listShiftHandovers()
      .then(setHandovers)
      .catch((e) => setError(String(e.message ?? e)));
  }

  useEffect(loadHandovers, []);

  async function onGenerate(e: FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    try {
      await api.generateShiftHandover(
        new Date(periodStart).toISOString(),
        new Date(periodEnd).toISOString(),
      );
      loadHandovers();
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
          <h1>Shift Handover</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Summarize a shift's incidents into a handover note for the next on-call engineer.
          </p>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Generate for a window</h2>
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
              {generating ? "Generating…" : "Generate Handover"}
            </button>
          </div>
        </form>
        <PendingHint active={generating} />
      </div>

      {error && <p className="error">{error}</p>}

      <h2>Past Handovers</h2>
      {!handovers && <p className="empty">Loading…</p>}
      {handovers && handovers.length === 0 && <p className="empty">No handovers generated yet.</p>}
      {handovers && handovers.length > 0 && (
        <div className="incident-list">
          {handovers.map((h) => (
            <Link key={h.id} href={`/shift-handovers/${h.id}`} className="incident-row">
              <div>
                <div className="incident-title">
                  {new Date(h.periodStart).toLocaleString()} → {new Date(h.periodEnd).toLocaleString()}
                </div>
                <div className="incident-meta">Generated {new Date(h.createdAt).toLocaleString()}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
