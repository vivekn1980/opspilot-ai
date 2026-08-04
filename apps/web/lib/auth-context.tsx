"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "./api";
import { User } from "./types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const PUBLIC_PATHS = ["/login", "/register", "/join"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  async function refresh() {
    try {
      const result = await api.getCurrentUser();
      setUser(result.user);
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPublicPath = PUBLIC_PATHS.includes(pathname ?? "");

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublicPath) {
      router.replace("/login");
    } else if (user && isPublicPath) {
      router.replace("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, isPublicPath]);

  async function logout() {
    await api.logout().catch(() => {});
    setUser(null);
    router.replace("/login");
  }

  // Only render the actual page once we know whether the current path is
  // allowed for the current auth state — otherwise a protected page would
  // flash its content for a frame before the redirect effect above fires.
  const ready = !loading && ((user && !isPublicPath) || (!user && isPublicPath));

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {ready ? children : <div className="auth-loading">Loading…</div>}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
