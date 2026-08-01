"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Problem } from "@/lib/types";

const statusDot: Record<string, string> = {
  OPEN: "dot-critical",
  IDENTIFIED: "dot-warn",
  RESOLVED: "dot-good",
};

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listProblems()
      .then(setProblems)
      .catch((e) => setError(String(e.message ?? e)));
  }, []);

  return (
    <main>
      <div className="page-header">
        <div>
          <h1>Problems</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Recurring root causes behind related incidents.
          </p>
        </div>
        <Link href="/problems/new" className="btn">
          + New Problem
        </Link>
      </div>

      {error && <p className="error">Failed to load problems: {error}</p>}
      {!problems && !error && <p className="empty">Loading…</p>}
      {problems && problems.length === 0 && (
        <div className="empty">
          No problems yet. <Link href="/problems/new">Create the first one</Link>.
        </div>
      )}

      {problems && problems.length > 0 && (
        <div className="incident-list">
          {problems.map((problem) => (
            <Link key={problem.id} href={`/problems/${problem.id}`} className="incident-row">
              <div>
                <div className="incident-title">{problem.title}</div>
                <div className="incident-meta">{new Date(problem.createdAt).toLocaleString()}</div>
              </div>
              <span className="pill">
                <span className={`dot ${statusDot[problem.status]}`} />
                {problem.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
