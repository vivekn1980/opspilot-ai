"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Risk } from "@/lib/types";

const levelDot: Record<string, string> = {
  LOW: "dot-good",
  MEDIUM: "dot-warn",
  HIGH: "dot-critical",
};

export default function RisksPage() {
  const [risks, setRisks] = useState<Risk[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listRisks()
      .then(setRisks)
      .catch((e) => setError(String(e.message ?? e)));
  }, []);

  return (
    <main>
      <div className="page-header">
        <div>
          <h1>Risk Register</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Tracked risks, scored by likelihood and impact.
          </p>
        </div>
        <Link href="/risks/new" className="btn">
          + New Risk
        </Link>
      </div>

      {error && <p className="error">Failed to load risks: {error}</p>}
      {!risks && !error && <p className="empty">Loading…</p>}
      {risks && risks.length === 0 && (
        <div className="empty">
          No risks yet. <Link href="/risks/new">Log the first one</Link>.
        </div>
      )}

      {risks && risks.length > 0 && (
        <div className="incident-list">
          {risks.map((risk) => (
            <Link key={risk.id} href={`/risks/${risk.id}`} className="incident-row">
              <div>
                <div className="incident-title">{risk.title}</div>
                <div className="incident-meta">{new Date(risk.createdAt).toLocaleString()}</div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <span className="pill">
                  <span className={`dot ${levelDot[risk.likelihood]}`} />
                  {risk.likelihood} likelihood
                </span>
                <span className="pill">
                  <span className={`dot ${levelDot[risk.impact]}`} />
                  {risk.impact} impact
                </span>
                <span className="pill">{risk.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
