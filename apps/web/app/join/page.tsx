"use client";

import { Suspense, useState, FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

function JoinForm() {
  const { refresh } = useAuth();
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") ?? "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.acceptInvite({ code, name, email, password });
      await refresh();
    } catch (e: any) {
      setError(String(e.message ?? e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1 style={{ marginTop: 0 }}>Join a team</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 0, fontSize: "0.85rem" }}>
          Using an invite link from a teammate adds you to their organization as a Viewer — an admin
          there can promote you afterward.
        </p>
        <form onSubmit={onSubmit}>
          <label>
            Invite code
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your invite code"
            />
          </label>
          <label>
            Name
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
          </label>
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </label>
          {error && <p className="error">{error}</p>}
          <div>
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? "Joining…" : "Join Team"}
            </button>
          </div>
        </form>
        <p className="auth-switch">
          Don&apos;t have an invite? <Link href="/register">Create a new workspace</Link>
        </p>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="auth-loading">Loading…</div>}>
      <JoinForm />
    </Suspense>
  );
}
