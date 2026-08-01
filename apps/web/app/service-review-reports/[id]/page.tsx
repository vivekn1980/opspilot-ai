"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { ServiceReviewReport } from "@/lib/types";

export default function ServiceReviewReportDetailPage() {
  const params = useParams<{ id: string }>();
  const [report, setReport] = useState<ServiceReviewReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getServiceReviewReport(params.id)
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
      <h1>{report.accountName}</h1>
      <p className="incident-meta">
        {new Date(report.periodStart).toLocaleDateString()} –{" "}
        {new Date(report.periodEnd).toLocaleDateString()} · Generated{" "}
        {new Date(report.createdAt).toLocaleString()}
      </p>
      <textarea className="output" rows={22} readOnly value={report.content} style={{ marginTop: "1rem" }} />
    </main>
  );
}
