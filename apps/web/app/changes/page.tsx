"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Change } from "@/lib/types";

const riskDot: Record<string, string> = {
  LOW: "dot-good",
  MEDIUM: "dot-warn",
  HIGH: "dot-critical",
};

export default function ChangesPage() {
  const [changes, setChanges] = useState<Change[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listChanges()
      .then(setChanges)
      .catch((e) => setError(String(e.message ?? e)));
  }, []);

  return (
    <main>
      <div className="page-header">
        <div>
          <h1>Changes</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Planned changes, their risk, and approval status.
          </p>
        </div>
        <Link href="/changes/new" className="btn">
          + New Change
        </Link>
      </div>

      {error && <p className="error">Failed to load changes: {error}</p>}
      {!changes && !error && <p className="empty">Loading…</p>}
      {changes && changes.length === 0 && (
        <div className="empty">
          No changes yet. <Link href="/changes/new">Create the first one</Link>.
        </div>
      )}

      {changes && changes.length > 0 && (
        <div className="incident-list">
          {changes.map((change) => (
            <Link key={change.id} href={`/changes/${change.id}`} className="incident-row">
              <div>
                <div className="incident-title">{change.title}</div>
                <div className="incident-meta">
                  {change.scheduledAt
                    ? `Scheduled ${new Date(change.scheduledAt).toLocaleString()}`
                    : new Date(change.createdAt).toLocaleString()}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <span className="pill">
                  <span className={`dot ${riskDot[change.riskLevel]}`} />
                  {change.riskLevel}
                </span>
                <span className="pill">{change.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
