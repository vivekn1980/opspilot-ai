"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { ManagedUser, Role } from "@/lib/types";

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<ManagedUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  function load() {
    api
      .listUsers()
      .then(setUsers)
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
