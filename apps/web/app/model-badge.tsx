"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { AiProvider } from "@/lib/types";

const LABEL: Record<AiProvider, string> = {
  KIMI: "Kimi K3",
  ANTHROPIC: "Claude Opus 5",
};

export default function ModelBadge() {
  const [provider, setProvider] = useState<AiProvider | null>(null);

  useEffect(() => {
    api
      .getSettings()
      .then((s) => setProvider(s.aiProvider))
      .catch(() => setProvider(null));
  }, []);

  if (!provider) return null;

  return (
    <Link href="/settings" className="model-badge">
      Model: {LABEL[provider]}
    </Link>
  );
}
