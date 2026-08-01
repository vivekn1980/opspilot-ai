"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Runbook, RunbookRun } from "@/lib/types";

export default function RunbookRunPage() {
  const params = useParams<{ id: string; runId: string }>();
  const [runbook, setRunbook] = useState<Runbook | null>(null);
  const [run, setRun] = useState<RunbookRun | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState<number | null>(null);

  function load() {
    api
      .getRunbook(params.id)
      .then(setRunbook)
      .catch((e) => setError(String(e.message ?? e)));
    api
      .getRunbookRun(params.id, params.runId)
      .then(setRun)
      .catch((e) => setError(String(e.message ?? e)));
  }

  useEffect(load, [params.id, params.runId]);

  async function onToggleStep(order: number, completed: boolean) {
    setSavingOrder(order);
    setError(null);
    try {
      const updated = await api.updateRunbookStep(params.id, params.runId, order, completed);
      setRun(updated);
    } catch (e: any) {
      setError(String(e.message ?? e));
    } finally {
      setSavingOrder(null);
    }
  }

  if (error && (!runbook || !run)) {
    return (
      <main>
        <p className="error">Failed to load run: {error}</p>
      </main>
    );
  }

  if (!runbook || !run) {
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
          <p style={{ color: "var(--text-muted)" }}>
            Run started {new Date(run.startedAt).toLocaleString()}
          </p>
        </div>
        <span className="pill">{run.status}</span>
      </div>

      {error && <p className="error">{error}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {runbook.steps.map((step) => {
          const result = run.stepResults.find((r) => r.order === step.order);
          const completed = result?.completed ?? false;
          return (
            <label
              key={step.order}
              className="card"
              style={{ display: "flex", alignItems: "flex-start", gap: "0.7rem", cursor: "pointer" }}
            >
              <input
                type="checkbox"
                checked={completed}
                disabled={savingOrder === step.order}
                onChange={(e) => onToggleStep(step.order, e.target.checked)}
                style={{ marginTop: "0.2rem" }}
              />
              <div style={{ opacity: completed ? 0.6 : 1 }}>
                <strong style={{ textDecoration: completed ? "line-through" : "none" }}>
                  {step.order}. {step.description}
                </strong>
                {step.command && (
                  <div
                    className="incident-meta"
                    style={{ marginTop: "0.4rem", fontFamily: "var(--font-mono)" }}
                  >
                    {step.command}
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {run.status === "COMPLETED" && (
        <p style={{ color: "var(--good)", marginTop: "1rem" }}>
          All steps complete{run.completedAt ? ` — ${new Date(run.completedAt).toLocaleString()}` : ""}.
        </p>
      )}
    </main>
  );
}
