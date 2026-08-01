"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Runbook, RunbookRun } from "@/lib/types";

export default function RunbookDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [runbook, setRunbook] = useState<Runbook | null>(null);
  const [runs, setRuns] = useState<RunbookRun[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  function load() {
    api
      .getRunbook(params.id)
      .then(setRunbook)
      .catch((e) => setError(String(e.message ?? e)));
    api
      .listRunbookRuns(params.id)
      .then(setRuns)
      .catch((e) => setError(String(e.message ?? e)));
  }

  useEffect(load, [params.id]);

  async function onStartRun() {
    setStarting(true);
    setError(null);
    try {
      const run = await api.startRunbookRun(params.id);
      router.push(`/runbooks/${params.id}/runs/${run.id}`);
    } catch (e: any) {
      setError(String(e.message ?? e));
      setStarting(false);
    }
  }

  if (error && !runbook) {
    return (
      <main>
        <p className="error">Failed to load runbook: {error}</p>
      </main>
    );
  }

  if (!runbook) {
    return (
      <main>
        <p className="empty">Loading…</p>
      </main>
    );
  }

  return (
    <main>
      <div className="page-header">
        <div>
          <h1>{runbook.title}</h1>
          <p style={{ color: "var(--text-muted)" }}>{runbook.description}</p>
        </div>
        <button className="btn" onClick={onStartRun} disabled={starting}>
          {starting ? "Starting…" : "Start Run"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <h2>Steps</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {runbook.steps.map((step) => (
          <div key={step.order} className="card">
            <strong>
              {step.order}. {step.description}
            </strong>
            {step.command && (
              <div className="incident-meta" style={{ marginTop: "0.4rem", fontFamily: "var(--font-mono)" }}>
                {step.command}
              </div>
            )}
          </div>
        ))}
      </div>

      <h2>Runs</h2>
      {!runs && <p className="empty">Loading…</p>}
      {runs && runs.length === 0 && <p className="empty">No runs yet.</p>}
      {runs && runs.length > 0 && (
        <div className="incident-list">
          {runs.map((run) => {
            const done = run.stepResults.filter((r) => r.completed).length;
            return (
              <a
                key={run.id}
                href={`/runbooks/${runbook.id}/runs/${run.id}`}
                className="incident-row"
              >
                <div>
                  <div className="incident-title">Started {new Date(run.startedAt).toLocaleString()}</div>
                  <div className="incident-meta">
                    {done}/{run.stepResults.length} steps complete
                  </div>
                </div>
                <span className="pill">{run.status}</span>
              </a>
            );
          })}
        </div>
      )}
    </main>
  );
}
