"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { CustomerUpdate, Incident, IncidentStatus } from "@/lib/types";

export default function IncidentDetailPage() {
  const params = useParams<{ id: string }>();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [customerUpdates, setCustomerUpdates] = useState<CustomerUpdate[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingRca, setGeneratingRca] = useState(false);
  const [generatingUpdate, setGeneratingUpdate] = useState(false);
  const [rawLogsDraft, setRawLogsDraft] = useState("");

  function load() {
    api
      .getIncident(params.id)
      .then((incident) => {
        setIncident(incident);
        setRawLogsDraft(incident.rawLogs ?? "");
      })
      .catch((e) => setError(String(e.message ?? e)));
    api
      .listCustomerUpdates(params.id)
      .then(setCustomerUpdates)
      .catch((e) => setError(String(e.message ?? e)));
  }

  useEffect(load, [params.id]);

  async function onStatusChange(status: IncidentStatus) {
    if (!incident) return;
    const updated = await api.updateIncident(incident.id, { status });
    setIncident(updated);
  }

  async function onAnalyzeLogs() {
    if (!incident) return;
    setAnalyzing(true);
    setError(null);
    try {
      const updated = await api.analyzeLogs(incident.id, rawLogsDraft || undefined);
      setIncident(updated);
    } catch (e: any) {
      setError(String(e.message ?? e));
    } finally {
      setAnalyzing(false);
    }
  }

  async function onGenerateRca() {
    if (!incident) return;
    setGeneratingRca(true);
    setError(null);
    try {
      const updated = await api.generateRca(incident.id);
      setIncident(updated);
    } catch (e: any) {
      setError(String(e.message ?? e));
    } finally {
      setGeneratingRca(false);
    }
  }

  async function onGenerateCustomerUpdate() {
    if (!incident) return;
    setGeneratingUpdate(true);
    setError(null);
    try {
      const newUpdate = await api.generateCustomerUpdate(incident.id);
      setCustomerUpdates((prev) => [...(prev ?? []), newUpdate]);
    } catch (e: any) {
      setError(String(e.message ?? e));
    } finally {
      setGeneratingUpdate(false);
    }
  }

  if (error && !incident) {
    return (
      <main>
        <p className="error">Failed to load incident: {error}</p>
      </main>
    );
  }

  if (!incident) {
    return (
      <main>
        <p className="empty">Loading…</p>
      </main>
    );
  }

  return (
    <main>
      <h1>{incident.title}</h1>
      <p style={{ color: "var(--text-muted)" }}>{incident.description}</p>

      <div className="section-actions">
        <span className="pill">{incident.severity}</span>
        <select
          value={incident.status}
          onChange={(e) => onStatusChange(e.target.value as IncidentStatus)}
        >
          <option value="OPEN">OPEN</option>
          <option value="INVESTIGATING">INVESTIGATING</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="CLOSED">CLOSED</option>
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      <h2>Raw Logs</h2>
      <textarea
        rows={8}
        value={rawLogsDraft}
        onChange={(e) => setRawLogsDraft(e.target.value)}
        placeholder="Paste log excerpts here…"
      />
      <div className="section-actions" style={{ marginTop: "0.7rem" }}>
        <button className="btn" onClick={onAnalyzeLogs} disabled={analyzing || !rawLogsDraft}>
          {analyzing ? "Analyzing…" : "Analyze Logs"}
        </button>
      </div>

      <h2>AI Log Analysis</h2>
      {incident.logAnalysis ? (
        <textarea className="output" rows={10} readOnly value={incident.logAnalysis} />
      ) : (
        <p className="empty">No analysis yet. Add logs above and run the analyzer.</p>
      )}

      <h2>RCA Report</h2>
      <div className="section-actions">
        <button className="btn" onClick={onGenerateRca} disabled={generatingRca}>
          {generatingRca ? "Generating…" : "Generate RCA"}
        </button>
      </div>
      {incident.rcaReport ? (
        <textarea className="output" rows={16} readOnly value={incident.rcaReport} />
      ) : (
        <p className="empty">No RCA yet.</p>
      )}

      <h2>Customer Updates</h2>
      <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
        Plain-language status updates for affected customers — no internal detail.
      </p>
      <div className="section-actions">
        <button className="btn" onClick={onGenerateCustomerUpdate} disabled={generatingUpdate}>
          {generatingUpdate ? "Drafting…" : "Generate Update"}
        </button>
      </div>
      {!customerUpdates || customerUpdates.length === 0 ? (
        <p className="empty">No customer updates drafted yet.</p>
      ) : (
        <div className="incident-list">
          {customerUpdates.map((update) => (
            <div key={update.id} className="card" style={{ display: "block" }}>
              <div className="incident-meta" style={{ marginBottom: "0.4rem" }}>
                {new Date(update.createdAt).toLocaleString()}
              </div>
              <p style={{ margin: 0 }}>{update.content}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
