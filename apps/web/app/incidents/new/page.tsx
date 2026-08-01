"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function NewIncidentPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("SEV3");
  const [rawLogs, setRawLogs] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const incident = await api.createIncident({
        title,
        description,
        severity,
        rawLogs: rawLogs || undefined,
      });
      router.push(`/incidents/${incident.id}`);
    } catch (e: any) {
      setError(String(e.message ?? e));
      setSubmitting(false);
    }
  }

  return (
    <main>
      <h1>New Incident</h1>
      <form onSubmit={onSubmit}>
        <label>
          Title
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Checkout API returning 500s"
          />
        </label>
        <label>
          Description
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's happening, when it started, who's affected"
          />
        </label>
        <label>
          Severity
          <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="SEV1">SEV1 — Critical</option>
            <option value="SEV2">SEV2 — High</option>
            <option value="SEV3">SEV3 — Medium</option>
            <option value="SEV4">SEV4 — Low</option>
          </select>
        </label>
        <label>
          Raw logs (optional — feeds the AI Log Analyzer)
          <textarea
            rows={8}
            value={rawLogs}
            onChange={(e) => setRawLogs(e.target.value)}
            placeholder="Paste log excerpts here…"
          />
        </label>
        {error && <p className="error">{error}</p>}
        <div>
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create Incident"}
          </button>
        </div>
      </form>
    </main>
  );
}
