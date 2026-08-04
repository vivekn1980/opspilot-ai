"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const { refresh } = useAuth();
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.register({ name, email, password, organizationName });
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
        <h1 style={{ marginTop: 0 }}>Create an account</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 0, fontSize: "0.85rem" }}>
          This creates a new, private workspace with you as its admin — not a login to an existing one.
        </p>
        <form onSubmit={onSubmit}>
          <label>
            Name
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
          </label>
          <label>
            Organization name
            <input
              required
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="Acme Corp"
            />
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
              {submitting ? "Creating account…" : "Create Account"}
            </button>
          </div>
        </form>
        <p className="auth-switch">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
        <p className="auth-switch">
          Have an invite code? <Link href="/join">Join a team</Link>
        </p>
      </div>
    </div>
  );
}
