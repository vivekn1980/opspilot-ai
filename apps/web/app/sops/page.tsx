"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Incident, Sop } from "@/lib/types";

export default function SopsPage() {
  const [sops, setSops] = useState<Sop[] | null>(null);
  const [incidents, setIncidents] = useState<Incident[] | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadSops() {
    api
      .listSops()
      .then(setSops)
      .catch((e) => setError(String(e.message ?? e)));
  }

  useEffect(() => {
    loadSops();
    api
      .listIncidents()
      .then((list) => {
        setIncidents(list);
        if (list.length > 0) setSelectedIncidentId(list[0].id);
      })
      .catch((e) => setError(String(e.message ?? e)));
  }, []);

  async function onGenerate() {
    if (!selectedIncidentId) return;
    setGenerating(true);
    setError(null);
    try {
      await api.generateSop(selectedIncidentId);
      loadSops();
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
          <h1>SOPs</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Standard operating procedures drafted from resolved incidents.
          </p>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Generate from an incident</h2>
        {incidents && incidents.length === 0 ? (
          <p className="empty">
            No incidents yet — <Link href="/incidents/new">create one</Link> first.
          </p>
        ) : (
          <div className="section-actions" style={{ alignItems: "center" }}>
            <select value={selectedIncidentId} onChange={(e) => setSelectedIncidentId(e.target.value)}>
              {incidents?.map((incident) => (
                <option key={incident.id} value={incident.id}>
                  {incident.title}
                </option>
              ))}
            </select>
            <button className="btn" onClick={onGenerate} disabled={generating || !selectedIncidentId}>
              {generating ? "Generating…" : "Generate SOP"}
            </button>
          </div>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      <h2>Drafted SOPs</h2>
      {!sops && <p className="empty">Loading…</p>}
      {sops && sops.length === 0 && <p className="empty">No SOPs generated yet.</p>}
      {sops && sops.length > 0 && (
        <div className="incident-list">
          {sops.map((sop) => (
            <Link key={sop.id} href={`/sops/${sop.id}`} className="incident-row">
              <div>
                <div className="incident-title">{sop.title}</div>
                <div className="incident-meta">{new Date(sop.createdAt).toLocaleString()}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
