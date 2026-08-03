"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Risk, RiskStatus } from "@/lib/types";
import AiOutput from "@/components/ai-output";
import PendingHint from "@/components/pending-hint";

export default function RiskDetailPage() {
  const params = useParams<{ id: string }>();
  const [risk, setRisk] = useState<Risk | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  function load() {
    api
      .getRisk(params.id)
      .then(setRisk)
      .catch((e) => setError(String(e.message ?? e)));
  }

  useEffect(load, [params.id]);

  async function onStatusChange(status: RiskStatus) {
    if (!risk) return;
    const updated = await api.updateRisk(risk.id, { status });
    setRisk(updated);
  }

  async function onGenerateMitigation() {
    if (!risk) return;
    setGenerating(true);
    setError(null);
    try {
      const updated = await api.generateRiskMitigation(risk.id);
      setRisk(updated);
    } catch (e: any) {
      setError(String(e.message ?? e));
    } finally {
      setGenerating(false);
    }
  }

  if (error && !risk) {
    return (
      <main>
        <p className="error">Failed to load risk: {error}</p>
      </main>
    );
  }

  if (!risk) {
    return (
      <main>
        <p className="empty">Loading…</p>
      </main>
    );
  }

  return (
    <main>
      <h1>{risk.title}</h1>
      <p style={{ color: "var(--text-muted)" }}>{risk.description}</p>

      <div className="section-actions">
        <span className="pill">{risk.likelihood} likelihood</span>
        <span className="pill">{risk.impact} impact</span>
        <select value={risk.status} onChange={(e) => onStatusChange(e.target.value as RiskStatus)}>
          <option value="OPEN">OPEN</option>
          <option value="MITIGATING">MITIGATING</option>
          <option value="ACCEPTED">ACCEPTED</option>
          <option value="CLOSED">CLOSED</option>
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      <h2>Mitigation Plan</h2>
      <div className="section-actions">
        <button className="btn" onClick={onGenerateMitigation} disabled={generating}>
          {generating ? "Drafting…" : "Generate Mitigation"}
        </button>
      </div>
      <PendingHint active={generating} />
      {risk.mitigation ? (
        <AiOutput content={risk.mitigation} />
      ) : (
        <p className="empty">No mitigation plan drafted yet.</p>
      )}
    </main>
  );
}
