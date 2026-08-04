"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Invite, ManagedUser, Role } from "@/lib/types";

function inviteLink(code: string) {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/join?code=${code}`;
}

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<ManagedUser[] | null>(null);
  const [invites, setInvites] = useState<Invite[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [revokingInvite, setRevokingInvite] = useState<string | null>(null);
  const [newInviteLink, setNewInviteLink] = useState<string | null>(null);

  function load() {
    api
      .listUsers()
      .then(setUsers)
      .catch((e) => setError(String(e.message ?? e)));
    api
      .listInvites()
      .then(setInvites)
      .catch((e) => setError(String(e.message ?? e)));
  }

  useEffect(() => {
    if (user?.role === "ADMIN") load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function onChangeRole(id: string, role: Role) {
    setUpdating(id);
    setError(null);
    try {
      await api.updateUserRole(id, role);
      load();
    } catch (e: any) {
      setError(String(e.message ?? e));
    } finally {
      setUpdating(null);
    }
  }

  async function onCreateInvite() {
    setCreatingInvite(true);
    setError(null);
    setNewInviteLink(null);
    try {
      const invite = await api.createInvite();
      setNewInviteLink(inviteLink(invite.code));
      load();
    } catch (e: any) {
      setError(String(e.message ?? e));
    } finally {
      setCreatingInvite(false);
    }
  }

  async function onRevokeInvite(id: string) {
    setRevokingInvite(id);
    setError(null);
    try {
      await api.revokeInvite(id);
      load();
    } catch (e: any) {
      setError(String(e.message ?? e));
    } finally {
      setRevokingInvite(null);
    }
  }

  if (user?.role !== "ADMIN") {
    return (
      <main>
        <div className="page-header">
          <div>
            <h1>Users</h1>
          </div>
        </div>
        <p className="error">Admins only.</p>
      </main>
    );
  }

  const pendingInvites = invites?.filter((i) => !i.usedAt && new Date(i.expiresAt) > new Date()) ?? [];

  return (
    <main>
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Manage who can create, edit, delete, or generate content. Viewers can read everything.
          </p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Invite a teammate</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
          Generates a one-time link that joins your organization as a Viewer. Expires after 7 days or
          first use, whichever comes first — share it yourself, there's no email sent.
        </p>
        <div>
          <button className="btn" type="button" onClick={onCreateInvite} disabled={creatingInvite}>
            {creatingInvite ? "Generating…" : "Generate invite link"}
          </button>
        </div>
        {newInviteLink && (
          <p className="incident-meta" style={{ marginTop: "0.7rem", wordBreak: "break-all" }}>
            {newInviteLink}
          </p>
        )}
      </div>

      {pendingInvites.length > 0 && (
        <>
          <h2>Pending Invites</h2>
          <div className="incident-list">
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="incident-row" style={{ cursor: "default" }}>
                <div>
                  <div className="incident-title" style={{ wordBreak: "break-all" }}>
                    {inviteLink(invite.code)}
                  </div>
                  <div className="incident-meta">
                    Expires {new Date(invite.expiresAt).toLocaleString()}
                  </div>
                </div>
                <button
                  className="btn btn-ghost"
                  type="button"
                  disabled={revokingInvite === invite.id}
                  onClick={() => onRevokeInvite(invite.id)}
                  style={{ padding: "0.3rem 0.6rem", fontSize: "0.78rem" }}
                >
                  {revokingInvite === invite.id ? "Revoking…" : "Revoke"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <h2>Team</h2>
      {!users && !error && <p className="empty">Loading…</p>}

      {users && (
        <div className="incident-list">
          {users.map((u) => (
            <div key={u.id} className="incident-row" style={{ cursor: "default" }}>
              <div>
                <div className="incident-title">{u.name}</div>
                <div className="incident-meta">
                  {u.email} · joined {new Date(u.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span className="pill">
                  <span className={`dot ${u.role === "ADMIN" ? "dot-good" : "dot-muted"}`} />
                  {u.role}
                </span>
                {u.id !== user.id && (
                  <button
                    className="btn btn-ghost"
                    type="button"
                    disabled={updating === u.id}
                    onClick={() => onChangeRole(u.id, u.role === "ADMIN" ? "VIEWER" : "ADMIN")}
                    style={{ padding: "0.3rem 0.6rem", fontSize: "0.78rem" }}
                  >
                    {updating === u.id
                      ? "Updating…"
                      : u.role === "ADMIN"
                        ? "Demote to Viewer"
                        : "Promote to Admin"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
