"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { AiUsageSummary, Change, Doc, Incident, KpiSummary, Metric, Problem, Risk, Runbook, Sop } from "@/lib/types";
import { severityDot, statusDot } from "@/lib/badges";

const RESOLVED_STATUSES = ["RESOLVED", "CLOSED"];

function hoursSince(dateStr: string) {
  return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60);
}

export default function HomePage() {
  const [kpi, setKpi] = useState<KpiSummary | null>(null);
  const [incidents, setIncidents] = useState<Incident[] | null>(null);
  const [problems, setProblems] = useState<Problem[] | null>(null);
  const [changes, setChanges] = useState<Change[] | null>(null);
  const [risks, setRisks] = useState<Risk[] | null>(null);
  const [runbooks, setRunbooks] = useState<Runbook[] | null>(null);
  const [sops, setSops] = useState<Sop[] | null>(null);
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [metrics, setMetrics] = useState<Metric[] | null>(null);
  const [aiUsage, setAiUsage] = useState<AiUsageSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.getKpiSummary(),
      api.listIncidents(),
      api.listProblems(),
      api.listChanges(),
      api.listRisks(),
      api.listRunbooks(),
      api.listSops(),
      api.listDocs(),
      api.listMetrics(),
      api.getAiUsageSummary(),
    ])
      .then(([kpi, incidents, problems, changes, risks, runbooks, sops, docs, metrics, aiUsage]) => {
        setKpi(kpi);
        setIncidents(incidents);
        setProblems(problems);
        setChanges(changes);
        setRisks(risks);
        setRunbooks(runbooks);
        setSops(sops);
        setDocs(docs);
        setMetrics(metrics);
        setAiUsage(aiUsage);
      })
      .catch((e) => setError(String(e.message ?? e)));
  }, []);

  const loading =
    !kpi ||
    !incidents ||
    !problems ||
    !changes ||
    !risks ||
    !runbooks ||
    !sops ||
    !docs ||
    !metrics ||
    !aiUsage;

  const recentIncidents = incidents?.slice(0, 5) ?? [];
  const breaching =
    kpi && incidents
      ? incidents.filter(
          (i) =>
            !RESOLVED_STATUSES.includes(i.status) &&
            hoursSince(i.createdAt) > (kpi.slaTargetHours[i.severity] ?? Infinity),
        )
      : [];

  const openProblems = problems?.filter((p) => p.status !== "RESOLVED").length ?? 0;
  const scheduledChanges =
    changes?.filter((c) => c.status === "SCHEDULED" || c.status === "APPROVED").length ?? 0;
  const openRisks = risks?.filter((r) => r.status === "OPEN" || r.status === "MITIGATING").length ?? 0;

  const modules = [
    {
      href: "/problems",
      label: "Problems",
      desc: "Recurring root causes behind related incidents",
      meta: `${openProblems} open`,
    },
    {
      href: "/changes",
      label: "Changes",
      desc: "Planned changes, risk, and approval status",
      meta: `${scheduledChanges} scheduled`,
    },
    {
      href: "/risks",
      label: "Risk Register",
      desc: "Tracked risks, scored by likelihood and impact",
      meta: `${openRisks} open`,
    },
    {
      href: "/runbooks",
      label: "Runbooks",
      desc: "Ordered steps with a tracked checklist per run",
      meta: `${runbooks?.length ?? 0} runbooks`,
    },
    {
      href: "/sops",
      label: "SOPs",
      desc: "Standard procedures drafted from resolved incidents",
      meta: `${sops?.length ?? 0} drafted`,
    },
    {
      href: "/docs",
      label: "Docs & Chat",
      desc: "Ask questions over your runbooks and wiki pages",
      meta: `${docs?.length ?? 0} documents`,
    },
    { href: "/capacity", label: "Capacity Planning", desc: "Trend and forecast reads on pasted metrics", meta: null },
    {
      href: "/monitoring",
      label: "AI Monitoring Assistant",
      desc: "Ask questions and catch anomalies across pasted metric snapshots",
      meta: `${metrics?.length ?? 0} metric snapshots`,
    },
    {
      href: "/shift-handovers",
      label: "Shift Handover",
      desc: "Summarize a shift's activity for the next on-call",
      meta: null,
    },
    { href: "/kpi", label: "KPI / SLA", desc: "Full metrics view: severity, status, MTTR, SLA", meta: null },
    { href: "/executive-reports", label: "Executive Reports", desc: "Leadership-level rollups by period", meta: null },
    {
      href: "/service-review-reports",
      label: "Service Review",
      desc: "Account-facing QBR-style reports for MSP customers",
      meta: null,
    },
    {
      href: "/ai-usage",
      label: "AI Usage",
      desc: "Calls, tokens, and latency by provider across every AI feature",
      meta: `${aiUsage?.totalCalls ?? 0} calls logged`,
    },
  ];

  return (
    <main>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: "var(--text-muted)" }}>Live snapshot across incidents, risk, and change.</p>
        </div>
        <Link href="/incidents/new" className="btn">
          + New Incident
        </Link>
      </div>

      {error && <p className="error">Failed to load dashboard: {error}</p>}
      {loading && !error && <p className="empty">Loading…</p>}

      {kpi && (
        <div className="stat-grid">
          <div className="stat-tile">
            <div className="stat-label">Total Incidents</div>
            <div className="stat-value">{kpi.totalIncidents}</div>
          </div>
          <div className="stat-tile">
            <div className="stat-label">Open</div>
            <div className="stat-value">{kpi.openIncidents}</div>
          </div>
          <div className="stat-tile">
            <div className="stat-label">MTTR</div>
            <div className="stat-value">{kpi.mttrHours !== null ? `${kpi.mttrHours.toFixed(1)}h` : "—"}</div>
          </div>
          <div className={`stat-tile ${kpi.slaBreaches > 0 ? "stat-tile-critical" : ""}`}>
            <div className="stat-label">SLA Breaches</div>
            <div className="stat-value">{kpi.slaBreaches}</div>
          </div>
        </div>
      )}

      {incidents && (
        <div className="dashboard-panels">
          <div>
            <h2>Needs Attention</h2>
            {breaching.length === 0 ? (
              <p className="panel-empty-good">No open incidents past their SLA target.</p>
            ) : (
              <div className="incident-list">
                {breaching.map((incident) => (
                  <Link key={incident.id} href={`/incidents/${incident.id}`} className="incident-row">
                    <div>
                      <div className="incident-title">{incident.title}</div>
                      <div className="incident-meta">
                        Opened {new Date(incident.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <span className="pill">
                      <span className={`dot ${severityDot[incident.severity]}`} />
                      {incident.severity}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2>Recent Incidents</h2>
            {recentIncidents.length === 0 ? (
              <p className="empty">No incidents yet.</p>
            ) : (
              <div className="incident-list">
                {recentIncidents.map((incident) => (
                  <Link key={incident.id} href={`/incidents/${incident.id}`} className="incident-row">
                    <div>
                      <div className="incident-title">{incident.title}</div>
                      <div className="incident-meta">{new Date(incident.createdAt).toLocaleString()}</div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <span className="pill">
                        <span className={`dot ${severityDot[incident.severity]}`} />
                        {incident.severity}
                      </span>
                      <span className="pill">
                        <span className={`dot ${statusDot[incident.status]}`} />
                        {incident.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <Link href="/incidents" style={{ fontSize: "0.85rem" }}>
              View all incidents →
            </Link>
          </div>
        </div>
      )}

      <h2>Explore</h2>
      <div className="module-grid">
        {modules.map((m) => (
          <Link key={m.href} href={m.href} className="module-card">
            <div className="module-card-title">{m.label}</div>
            <div className="module-card-desc">{m.desc}</div>
            {m.meta && <div className="module-card-meta">{m.meta}</div>}
          </Link>
        ))}
      </div>
    </main>
  );
}
