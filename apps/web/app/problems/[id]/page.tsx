"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Problem, ProblemStatus } from "@/lib/types";

export default function ProblemDetailPage() {
  const params = useParams<{ id: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [rootCauseDraft, setRootCauseDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .getProblem(params.id)
      .then((p) => {
        setProblem(p);
        setRootCauseDraft(p.rootCause ?? "");
      })
      .catch((e) => setError(String(e.message ?? e)));
  }, [params.id]);

  async function onStatusChange(status: ProblemStatus) {
    if (!problem) return;
    const updated = await api.updateProblem(problem.id, { status });
    setProblem(updated);
  }

  async function onSaveRootCause() {
    if (!problem) return;
    setSaving(true);
    try {
      const updated = await api.updateProblem(problem.id, { rootCause: rootCauseDraft });
      setProblem(updated);
    } catch (e: any) {
      setError(String(e.message ?? e));
    } finally {
      setSaving(false);
    }
  }

  if (error && !problem) {
    return (
      <main>
        <p className="error">Failed to load problem: {error}</p>
      </main>
    );
  }

  if (!problem) {
    return (
      <main>
        <p className="empty">Loading…</p>
      </main>
    );
  }

  return (
    <main>
      <h1>{problem.title}</h1>
      <p style={{ color: "var(--text-muted)" }}>{problem.description}</p>

      <div className="section-actions">
        <select value={problem.status} onChange={(e) => onStatusChange(e.target.value as ProblemStatus)}>
          <option value="OPEN">OPEN</option>
          <option value="IDENTIFIED">IDENTIFIED</option>
          <option value="RESOLVED">RESOLVED</option>
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      <h2>Root Cause</h2>
      <textarea
        rows={6}
        value={rootCauseDraft}
        onChange={(e) => setRootCauseDraft(e.target.value)}
        placeholder="What's the underlying, recurring cause?"
      />
      <div className="section-actions" style={{ marginTop: "0.7rem" }}>
        <button className="btn" onClick={onSaveRootCause} disabled={saving}>
          {saving ? "Saving…" : "Save Root Cause"}
        </button>
      </div>
    </main>
  );
}
