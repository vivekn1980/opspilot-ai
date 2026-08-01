"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Sop } from "@/lib/types";
import AiOutput from "@/components/ai-output";

export default function SopDetailPage() {
  const params = useParams<{ id: string }>();
  const [sop, setSop] = useState<Sop | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getSop(params.id)
      .then(setSop)
      .catch((e) => setError(String(e.message ?? e)));
  }, [params.id]);

  if (error && !sop) {
    return (
      <main>
        <p className="error">Failed to load SOP: {error}</p>
      </main>
    );
  }

  if (!sop) {
    return (
      <main>
        <p className="empty">Loading…</p>
      </main>
    );
  }

  return (
    <main>
      <h1>{sop.title}</h1>
      <p className="incident-meta">Generated {new Date(sop.createdAt).toLocaleString()}</p>
      <div style={{ marginTop: "1rem" }}>
        <AiOutput content={sop.content} />
      </div>
    </main>
  );
}
