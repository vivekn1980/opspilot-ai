"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Incident } from "@/lib/types";

const severityDot: Record<string, string> = {
  SEV1: "dot-critical",
  SEV2: "dot-warn",
  SEV3: "dot-muted",
  SEV4: "dot-muted",
};

const statusDot: Record<string, string> = {
  OPEN: "dot-critical",
  INVESTIGATING: "dot-warn",
  RESOLVED: "dot-good",
  CLOSED: "dot-muted",
};

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<Incident[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listIncidents()
      .then(setIncidents)
      .catch((e) => setError(String(e.message ?? e)));
  }, []);

  return (
    <main>
      <h1>Incidents</h1>
      <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
        Detect, understand, and communicate incidents from one place.
      </p>

      {error && <p className="error">Failed to load incidents: {error}</p>}

      {!incidents && !error && <p className="empty">Loading…</p>}

      {incidents && incidents.length === 0 && (
        <div className="empty">
          No incidents yet.{" "}
          <Link href="/incidents/new">Create the first one</Link>.
        </div>
      )}

      {incidents && incidents.length > 0 && (
        <div className="incident-list">
          {incidents.map((incident) => (
            <Link
              key={incident.id}
              href={`/incidents/${incident.id}`}
              className="incident-row"
            >
              <div>
                <div className="incident-title">{incident.title}</div>
                <div className="incident-meta">
                  {new Date(incident.createdAt).toLocaleString()}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <span className="pill">
                  <span className={`dot ${severityDot[incident.severity]}`} />
                  {incident.severity}
                </span>
                <span className="pill">
                  <span className={`dot ${statusDot[incident.status]}`} />
                  {incident.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
