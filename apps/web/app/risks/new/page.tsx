"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function NewRiskPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [likelihood, setLikelihood] = useState("MEDIUM");
  const [impact, setImpact] = useState("MEDIUM");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const risk = await api.createRisk({ title, description, likelihood, impact });
      router.push(`/risks/${risk.id}`);
    } catch (e: any) {
      setError(String(e.message ?? e));
      setSubmitting(false);
    }
  }

  return (
    <main>
      <h1>New Risk</h1>
      <form onSubmit={onSubmit}>
        <label>
          Title
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Single-region deployment for a customer-facing service"
          />
        </label>
        <label>
          Description
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What could go wrong, and why it matters"
          />
        </label>
        <label>
          Likelihood
          <select value={likelihood} onChange={(e) => setLikelihood(e.target.value)}>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
        </label>
        <label>
          Impact
          <select value={impact} onChange={(e) => setImpact(e.target.value)}>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
        </label>
        {error && <p className="error">{error}</p>}
        <div>
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create Risk"}
          </button>
        </div>
      </form>
    </main>
  );
}
