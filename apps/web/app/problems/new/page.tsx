"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function NewProblemPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const problem = await api.createProblem({ title, description });
      router.push(`/problems/${problem.id}`);
    } catch (e: any) {
      setError(String(e.message ?? e));
      setSubmitting(false);
    }
  }

  return (
    <main>
      <h1>New Problem</h1>
      <form onSubmit={onSubmit}>
        <label>
          Title
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Recurring checkout timeouts under load"
          />
        </label>
        <label>
          Description
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What pattern links the related incidents"
          />
        </label>
        {error && <p className="error">{error}</p>}
        <div>
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create Problem"}
          </button>
        </div>
      </form>
    </main>
  );
}
