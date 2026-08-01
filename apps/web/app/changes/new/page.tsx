"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function NewChangePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [riskLevel, setRiskLevel] = useState("MEDIUM");
  const [scheduledAt, setScheduledAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const change = await api.createChange({
        title,
        description,
        riskLevel,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      });
      router.push(`/changes/${change.id}`);
    } catch (e: any) {
      setError(String(e.message ?? e));
      setSubmitting(false);
    }
  }

  return (
    <main>
      <h1>New Change</h1>
      <form onSubmit={onSubmit}>
        <label>
          Title
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Upgrade orders-db connection pool size"
          />
        </label>
        <label>
          Description
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's changing and why"
          />
        </label>
        <label>
          Risk level
          <select value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)}>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
        </label>
        <label>
          Scheduled for (optional)
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <div>
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create Change"}
          </button>
        </div>
      </form>
    </main>
  );
}
