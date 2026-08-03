"use client";

import { useElapsedSeconds } from "@/lib/useElapsedSeconds";

export default function PendingHint({
  active,
  thresholdSeconds = 12,
}: {
  active: boolean;
  thresholdSeconds?: number;
}) {
  const elapsed = useElapsedSeconds(active);
  if (!active || elapsed < thresholdSeconds) return null;

  return (
    <p className="pending-hint">
      Still working ({elapsed}s) — free-tier models can take a minute or more.
    </p>
  );
}
