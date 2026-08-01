"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { ShiftHandover } from "@/lib/types";

export default function ShiftHandoverDetailPage() {
  const params = useParams<{ id: string }>();
  const [handover, setHandover] = useState<ShiftHandover | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getShiftHandover(params.id)
      .then(setHandover)
      .catch((e) => setError(String(e.message ?? e)));
  }, [params.id]);

  if (error && !handover) {
    return (
      <main>
        <p className="error">Failed to load handover: {error}</p>
      </main>
    );
  }

  if (!handover) {
    return (
      <main>
        <p className="empty">Loading…</p>
      </main>
    );
  }

  return (
    <main>
      <h1>
        {new Date(handover.periodStart).toLocaleString()} → {new Date(handover.periodEnd).toLocaleString()}
      </h1>
      <p className="incident-meta">Generated {new Date(handover.createdAt).toLocaleString()}</p>
      <textarea
        className="output"
        rows={20}
        readOnly
        value={handover.summary}
        style={{ marginTop: "1rem" }}
      />
    </main>
  );
}
