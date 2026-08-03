"use client";

import { usePathname } from "next/navigation";
import NavLinks from "./nav-links";
import ModelBadge from "./model-badge";
import GlobalSearch from "../components/global-search";
import UserBadge from "../components/user-badge";
import { PUBLIC_PATHS } from "../lib/auth-context";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPath = PUBLIC_PATHS.includes(pathname ?? "");

  if (isPublicPath) {
    return <div className="shell">{children}</div>;
  }

  return (
    <div className="shell">
      <div className="topbar">
        <a href="/" className="brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="OpsPilot AI" className="brand-logo" />
        </a>
        <NavLinks />
        <GlobalSearch />
        <ModelBadge />
        <UserBadge />
      </div>
      {children}
    </div>
  );
}
