"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AiProvider } from "@/lib/types";

const PROVIDER_INFO: Record<AiProvider, { label: string; model: string; note: string }> = {
  KIMI: {
    label: "Kimi K3 (free)",
    model: "moonshotai/kimi-k3-free",
    note: "Routed via TokenRouter. Default — no cost, good for testing the AI features end to end.",
  },
  ANTHROPIC: {
    label: "Anthropic Claude",
    model: "claude-opus-5",
    note: "Anthropic's frontier model. Requires API credits on your Anthropic account.",
  },
};

export default function SettingsPage() {
  const [aiProvider, setAiProvider] = useState<AiProvider | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getSettings()
      .then((s) => setAiProvider(s.aiProvider))
      .catch((e) => setError(String(e.message ?? e)));
  }, []);

  async function onSelect(provider: AiProvider) {
    if (provider === aiProvider || saving) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateSettings(provider);
      setAiProvider(updated.aiProvider);
    } catch (e: any) {
      setError(String(e.message ?? e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main>
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Choose which model powers every AI feature across the app.
          </p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {!aiProvider && !error && <p className="empty">Loading…</p>}

      {aiProvider && (
        <div className="provider-grid">
          {(Object.keys(PROVIDER_INFO) as AiProvider[]).map((provider) => {
            const info = PROVIDER_INFO[provider];
            const selected = provider === aiProvider;
            return (
              <button
                key={provider}
                type="button"
                className={selected ? "provider-card selected" : "provider-card"}
                onClick={() => onSelect(provider)}
                disabled={saving}
              >
                <div className="provider-card-head">
                  <span className="provider-card-title">{info.label}</span>
                  {selected && <span className="pill">Active</span>}
                </div>
                <div className="incident-meta" style={{ fontFamily: "var(--font-mono)" }}>
                  {info.model}
                </div>
                <p className="provider-card-note">{info.note}</p>
              </button>
            );
          })}
        </div>
      )}

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <h2 style={{ marginTop: 0 }}>API keys</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
          Keys are configured server-side in <code>apps/api/.env</code> — never entered here — and apply
          to whichever provider is active above.
        </p>
        <ul style={{ color: "var(--text-muted)", fontSize: "0.88rem", paddingLeft: "1.2rem" }}>
          <li>
            <code>TOKENROUTER_API_KEY</code> — required for Kimi K3
          </li>
          <li>
            <code>ANTHROPIC_API_KEY</code> — required for Anthropic Claude
          </li>
        </ul>
      </div>
    </main>
  );
}
