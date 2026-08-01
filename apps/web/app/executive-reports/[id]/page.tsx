"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { ExecutiveReport } from "@/lib/types";

export default function ExecutiveReportDetailPage() {
  const params = useParams<{ id: string }>();
  const [report, setReport] = useState<ExecutiveReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getExecutiveReport(params.id)
      .then(setReport)
      .catch((e) => setError(String(e.message ?? e)));
  }, [params.id]);

  if (error && !report) {
    return (
      <main>
        <p className="error">Failed to load report: {error}</p>
      </main>
    );
  }

  if (!report) {
    return (
      <main>
        <p className="empty">Loading…</p>
      </main>
    );
  }

  return (
    <main>
      <h1>
        {new Date(report.periodStart).toLocaleDateString()} –{" "}
        {new Date(report.periodEnd).toLocaleDateString()}
      </h1>
      <p className="incident-meta">Generated {new Date(report.createdAt).toLocaleString()}</p>
      <textarea className="output" rows={22} readOnly value={report.content} style={{ marginTop: "1rem" }} />
    </main>
  );
}
