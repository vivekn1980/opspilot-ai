"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Change, ChangeStatus } from "@/lib/types";

export default function ChangeDetailPage() {
  const params = useParams<{ id: string }>();
  const [change, setChange] = useState<Change | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getChange(params.id)
      .then(setChange)
      .catch((e) => setError(String(e.message ?? e)));
  }, [params.id]);

  async function onStatusChange(status: ChangeStatus) {
    if (!change) return;
    const updated = await api.updateChange(change.id, { status });
    setChange(updated);
  }

  if (error && !change) {
    return (
      <main>
        <p className="error">Failed to load change: {error}</p>
      </main>
    );
  }

  if (!change) {
    return (
      <main>
        <p className="empty">Loading…</p>
      </main>
    );
  }

  return (
    <main>
      <h1>{change.title}</h1>
      <p style={{ color: "var(--text-muted)" }}>{change.description}</p>

      <div className="section-actions">
        <span className="pill">{change.riskLevel} risk</span>
        <select value={change.status} onChange={(e) => onStatusChange(e.target.value as ChangeStatus)}>
          <option value="PROPOSED">PROPOSED</option>
          <option value="APPROVED">APPROVED</option>
          <option value="SCHEDULED">SCHEDULED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {change.scheduledAt && (
        <p className="incident-meta">Scheduled for {new Date(change.scheduledAt).toLocaleString()}</p>
      )}

      {error && <p className="error">{error}</p>}
    </main>
  );
}
