"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface StepDraft {
  description: string;
  command: string;
}

export default function NewRunbookPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<StepDraft[]>([{ description: "", command: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateStep(index: number, field: keyof StepDraft, value: string) {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  function addStep() {
    setSteps((prev) => [...prev, { description: "", command: "" }]);
  }

  function removeStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const runbook = await api.createRunbook({
        title,
        description,
        steps: steps
          .filter((s) => s.description.trim())
          .map((s, i) => ({
            order: i + 1,
            description: s.description,
            command: s.command || undefined,
          })),
      });
      router.push(`/runbooks/${runbook.id}`);
    } catch (e: any) {
      setError(String(e.message ?? e));
      setSubmitting(false);
    }
  }

  return (
    <main>
      <h1>New Runbook</h1>
      <form onSubmit={onSubmit}>
        <label>
          Title
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Restart checkout-api after DB pool exhaustion"
          />
        </label>
        <label>
          Description
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="When to use this runbook"
          />
        </label>

        <div>
          <div className="incident-meta" style={{ marginBottom: "0.5rem" }}>
            STEPS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {steps.map((step, i) => (
              <div key={i} className="card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="incident-meta">Step {i + 1}</span>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => removeStep(i)}
                      style={{ padding: "0.2rem 0.5rem", fontSize: "0.78rem" }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  required
                  value={step.description}
                  onChange={(e) => updateStep(i, "description", e.target.value)}
                  placeholder="Describe the step"
                />
                <input
                  value={step.command}
                  onChange={(e) => updateStep(i, "command", e.target.value)}
                  placeholder="Command (optional)"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}
                />
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-ghost" onClick={addStep} style={{ marginTop: "0.6rem" }}>
            + Add Step
          </button>
        </div>

        {error && <p className="error">{error}</p>}
        <div>
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create Runbook"}
          </button>
        </div>
      </form>
    </main>
  );
}
