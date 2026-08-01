"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Runbook } from "@/lib/types";

export default function RunbooksPage() {
  const [runbooks, setRunbooks] = useState<Runbook[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listRunbooks()
      .then(setRunbooks)
      .catch((e) => setError(String(e.message ?? e)));
  }, []);

  return (
    <main>
      <div className="page-header">
        <div>
          <h1>Runbooks</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Ordered steps for a known scenario, with a tracked checklist per run.
          </p>
        </div>
        <Link href="/runbooks/new" className="btn">
          + New Runbook
        </Link>
      </div>

      {error && <p className="error">Failed to load runbooks: {error}</p>}
      {!runbooks && !error && <p className="empty">Loading…</p>}
      {runbooks && runbooks.length === 0 && (
        <div className="empty">
          No runbooks yet. <Link href="/runbooks/new">Create the first one</Link>.
        </div>
      )}

      {runbooks && runbooks.length > 0 && (
        <div className="incident-list">
          {runbooks.map((runbook) => (
            <Link key={runbook.id} href={`/runbooks/${runbook.id}`} className="incident-row">
              <div>
                <div className="incident-title">{runbook.title}</div>
                <div className="incident-meta">{runbook.steps.length} steps</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
