"use client";

import { useEffect, useState, FormEvent } from "react";
import { api } from "@/lib/api";
import { Metric, MonitoringAskResult } from "@/lib/types";
import AiOutput from "@/components/ai-output";
import PendingHint from "@/components/pending-hint";

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<Metric[] | null>(null);
  const [name, setName] = useState("");
  const [rawData, setRawData] = useState("");
  const [adding, setAdding] = useState(false);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [askResult, setAskResult] = useState<MonitoringAskResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function loadMetrics() {
    api
      .listMetrics()
      .then(setMetrics)
      .catch((e) => setError(String(e.message ?? e)));
  }

  useEffect(loadMetrics, []);

  async function onAddMetric(e: FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError(null);
    try {
      await api.createMetric({ name, rawData });
      setName("");
      setRawData("");
      loadMetrics();
    } catch (e: any) {
      setError(String(e.message ?? e));
    } finally {
      setAdding(false);
    }
  }

  async function onAsk(e: FormEvent) {
    e.preventDefault();
    setAsking(true);
    setError(null);
    setAskResult(null);
    try {
      const result = await api.askMonitoring(question);
      setAskResult(result);
    } catch (e: any) {
      setError(String(e.message ?? e));
    } finally {
      setAsking(false);
    }
  }

  return (
    <main>
      <div className="page-header">
        <div>
          <h1>AI Monitoring Assistant</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Ask questions and catch anomalies across pasted metric snapshots.
          </p>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Ask a question</h2>
        <form onSubmit={onAsk}>
          <label>
            Question
            <input
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Is anything unusual in the last hour of cpu_usage?"
            />
          </label>
          <div>
            <button className="btn" type="submit" disabled={asking}>
              {asking ? "Analyzing…" : "Ask"}
            </button>
          </div>
        </form>
        <PendingHint active={asking} />
        {askResult && (
          <div style={{ marginTop: "1rem" }}>
            <AiOutput content={askResult.answer} />
            {askResult.sources.length > 0 && (
              <p className="incident-meta" style={{ marginTop: "0.5rem" }}>
                Metrics considered: {askResult.sources.map((s) => s.name).join(", ")}
              </p>
            )}
          </div>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      <h2>Add metric snapshot</h2>
      <form onSubmit={onAddMetric}>
        <label>
          Metric name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="cpu_usage_pct (checkout-api)"
          />
        </label>
        <label>
          Data
          <textarea
            required
            rows={8}
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
            placeholder="Timestamp,value pairs or any raw metric dump…"
          />
        </label>
        <div>
          <button className="btn" type="submit" disabled={adding}>
            {adding ? "Adding…" : "Add Metric Snapshot"}
          </button>
        </div>
      </form>

      <h2>Metric Snapshots</h2>
      {!metrics && <p className="empty">Loading…</p>}
      {metrics && metrics.length === 0 && <p className="empty">No metric snapshots yet.</p>}
      {metrics && metrics.length > 0 && (
        <div className="incident-list">
          {metrics.map((metric) => (
            <div key={metric.id} className="incident-row" style={{ cursor: "default" }}>
              <div>
                <div className="incident-title">{metric.name}</div>
                <div className="incident-meta">{new Date(metric.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
