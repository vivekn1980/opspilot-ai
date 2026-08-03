"use client";

import { useAuth } from "@/lib/auth-context";

export default function UserBadge() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="user-badge">
      <span className="pill">
        <span className={`dot ${user.role === "ADMIN" ? "dot-good" : "dot-muted"}`} />
        {user.role}
      </span>
      <span>{user.name}</span>
      <button
        type="button"
        className="btn btn-ghost"
        style={{ padding: "0.3rem 0.6rem", fontSize: "0.78rem" }}
        onClick={() => logout()}
      >
        Log out
      </button>
    </div>
  );
}
