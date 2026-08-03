"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AiUsageLogEntry, AiUsageSummary } from "@/lib/types";

const PROVIDER_LABEL: Record<string, string> = {
  KIMI: "Kimi K3",
  ANTHROPIC: "Anthropic Claude",
};

export default function AiUsagePage() {
  const [summary, setSummary] = useState<AiUsageSummary | null>(null);
  const [recent, setRecent] = useState<AiUsageLogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getAiUsageSummary(), api.getRecentAiUsage()])
      .then(([summary, recent]) => {
        setSummary(summary);
        setRecent(recent);
      })
      .catch((e) => setError(String(e.message ?? e)));
  }, []);

  const totalTokens =
    summary?.providers.reduce((sum, p) => sum + p.inputTokens + p.outputTokens, 0) ?? 0;
  const successRate =
    summary && summary.totalCalls > 0
      ? (((summary.totalCalls - summary.totalFailures) / summary.totalCalls) * 100).toFixed(0)
      : null;

  return (
    <main>
      <div className="page-header">
        <div>
          <h1>AI Usage</h1>
          <p style={{ color: "var(--text-muted)" }}>
            How much each provider is actually being called, and roughly how many tokens it's using.
          </p>
        </div>
      </div>

      {error && <p className="error">Failed to load AI usage: {error}</p>}
      {!summary && !error && <p className="empty">Loading…</p>}

      {summary && (
        <>
          <div className="stat-grid">
            <div className="stat-tile">
              <div className="stat-label">Total Calls</div>
              <div className="stat-value">{summary.totalCalls}</div>
            </div>
            <div className={`stat-tile ${summary.totalFailures > 0 ? "stat-tile-critical" : ""}`}>
              <div className="stat-label">Failures</div>
              <div className="stat-value">{summary.totalFailures}</div>
            </div>
            <div className="stat-tile">
              <div className="stat-label">Success Rate</div>
              <div className="stat-value">{successRate !== null ? `${successRate}%` : "—"}</div>
            </div>
            <div className="stat-tile">
              <div className="stat-label">Total Tokens</div>
              <div className="stat-value">{totalTokens.toLocaleString()}</div>
            </div>
          </div>

          <p className="incident-meta" style={{ marginTop: "0.5rem" }}>
            Token counts come straight from each provider's response — multiply by your provider's
            per-token rate for an actual cost figure. Kimi K3 via TokenRouter is free regardless of
            token volume.
          </p>

          <h2>By Provider</h2>
          {summary.providers.length === 0 ? (
            <p className="empty">No AI calls logged yet.</p>
          ) : (
            <div className="dashboard-panels">
              {summary.providers.map((p) => (
                <div key={p.provider} className="card">
                  <div className="provider-card-title" style={{ marginBottom: "0.6rem" }}>
                    {PROVIDER_LABEL[p.provider] ?? p.provider}
                  </div>
                  <div className="stat-grid">
                    <div className="stat-tile">
                      <div className="stat-label">Calls</div>
                      <div className="stat-value">{p.calls}</div>
                    </div>
                    <div className="stat-tile">
                      <div className="stat-label">Avg Latency</div>
                      <div className="stat-value">{(p.avgLatencyMs / 1000).toFixed(1)}s</div>
                    </div>
                    <div className="stat-tile">
                      <div className="stat-label">Input Tokens</div>
                      <div className="stat-value">{p.inputTokens.toLocaleString()}</div>
                    </div>
                    <div className="stat-tile">
                      <div className="stat-label">Output Tokens</div>
                      <div className="stat-value">{p.outputTokens.toLocaleString()}</div>
                    </div>
                  </div>
                  <p className="incident-meta" style={{ marginTop: "0.6rem" }}>
                    {p.successes} succeeded, {p.failures} failed
                  </p>
                </div>
              ))}
            </div>
          )}

          <h2>Recent Calls</h2>
          {!recent && <p className="empty">Loading…</p>}
          {recent && recent.length === 0 && <p className="empty">No AI calls logged yet.</p>}
          {recent && recent.length > 0 && (
            <div className="incident-list">
              {recent.map((entry) => (
                <div key={entry.id} className="incident-row" style={{ cursor: "default" }}>
                  <div>
                    <div className="incident-title">{entry.feature}</div>
                    <div className="incident-meta">
                      {new Date(entry.createdAt).toLocaleString()} · {(entry.latencyMs / 1000).toFixed(1)}s
                      {entry.inputTokens !== null && entry.outputTokens !== null
                        ? ` · ${entry.inputTokens}+${entry.outputTokens} tokens`
                        : ""}
                      {!entry.success && entry.errorMessage ? ` · ${entry.errorMessage}` : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <span className="pill">
                      <span className="dot dot-muted" />
                      {PROVIDER_LABEL[entry.provider] ?? entry.provider}
                    </span>
                    <span className="pill">
                      <span className={`dot ${entry.success ? "dot-good" : "dot-critical"}`} />
                      {entry.success ? "OK" : "Failed"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
