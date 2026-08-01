"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { CapacityReport } from "@/lib/types";
import AiOutput from "@/components/ai-output";

export default function CapacityReportDetailPage() {
  const params = useParams<{ id: string }>();
  const [report, setReport] = useState<CapacityReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getCapacityReport(params.id)
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
      <h1>{report.metricName}</h1>
      <p className="incident-meta">Generated {new Date(report.createdAt).toLocaleString()}</p>

      <h2>Data</h2>
      <textarea className="output" rows={8} readOnly value={report.rawData} />

      <h2>Analysis</h2>
      <AiOutput content={report.narrative} />
    </main>
  );
}
